const express = require('express');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../utils/jwt');

// Helper to set refresh token cookie
function setRefreshCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  res.cookie('jid', token, cookieOptions);
}

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // --- Improved Validation ---
    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });

    // Add password strength check (e.g., minimum 6 characters)
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash: hash, phone });

    const accessToken = createAccessToken({ sub: user._id });
    const refreshToken = createRefreshToken({ sub: user._id });

    // Store refresh token on user for simple revocation
    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email }, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = createAccessToken({ sub: user._id });
    const refreshToken = createRefreshToken({ sub: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({ user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, city: user.city, pincode: user.pincode }, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google Login
router.post('/google-login', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Google authorization code is missing' });
    }

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'postmessage' // This redirect URI is required for the 'code' flow from a web client
    );
    // Exchange authorization code for tokens
    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;

    if (!idToken) return res.status(400).json({ message: 'Failed to retrieve ID token from Google' });

    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new one
      user = await User.create({
        name,
        email,
        googleId,
        // You might want to handle users who sign up with Google
        // differently, e.g., no local password.
        passwordHash: await bcrypt.hash(googleId + process.env.JWT_ACCESS_SECRET, 12)
      });
    }

    const accessToken = createAccessToken({ sub: user._id });
    const refreshToken = createRefreshToken({ sub: user._id });
    user.refreshToken = refreshToken;
    await user.save();
    setRefreshCookie(res, refreshToken);
    res.json({ user: { _id: user._id, name: user.name, email: user.email }, accessToken });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ message: 'Server error during Google login' });
  }
});

// Facebook Login
router.post('/facebook-login', async (req, res) => {
  try {
    const { accessToken: fbAccessToken } = req.body;
    if (!fbAccessToken) {
      return res.status(400).json({ message: 'Facebook access token is missing' });
    }

    // Verify the token with Facebook
    const { data } = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${fbAccessToken}`);

    if (!data || !data.id) {
      return res.status(401).json({ message: 'Invalid Facebook token' });
    }

    const { id: facebookId, name, email } = data;

    let user = await User.findOne({ $or: [{ email }, { facebookId }] });

    if (!user) {
      // If user doesn't exist, create a new one
      user = await User.create({
        name,
        email,
        facebookId,
        // Create a dummy hash or leave it empty if your schema allows
        passwordHash: await bcrypt.hash(facebookId + process.env.JWT_ACCESS_SECRET, 12)
      });
    }

    const accessToken = createAccessToken({ sub: user._id });
    const refreshToken = createRefreshToken({ sub: user._id });
    user.refreshToken = refreshToken;
    await user.save();
    setRefreshCookie(res, refreshToken);
    res.json({ user: { _id: user._id, name: user.name, email: user.email }, accessToken });
  } catch (err) {
    console.error('Facebook login error:', err.response ? err.response.data : err.message);
    res.status(500).json({ message: 'Server error during Facebook login' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies.jid;
    if (!token) return res.status(401).json({ message: 'No token' });

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.refreshToken) return res.status(401).json({ message: 'Invalid refresh token' });
    if (user.refreshToken !== token) return res.status(401).json({ message: 'Refresh token mismatch' });

    // rotate tokens
    const newAccess = createAccessToken({ sub: user._id });
    const newRefresh = createRefreshToken({ sub: user._id });
    user.refreshToken = newRefresh;
    await user.save();

    setRefreshCookie(res, newRefresh);
    res.json({ accessToken: newAccess });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.jid;
    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        await User.findByIdAndUpdate(payload.sub, { $unset: { refreshToken: '' } });
      } catch (e) {
        // ignore
      }
    }
    res.clearCookie('jid', { path: '/api/auth/refresh' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route example
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No auth header' });
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid auth header' });
    const token = parts[1];
    const { verifyAccessToken } = require('../utils/jwt');
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid access token' });
    }
    const user = await User.findById(payload.sub).select('-passwordHash -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
