const express = require('express');
const crypto = require('crypto');
const User = require('../models/user');
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// configure email (USE MAILTRAP OR GMAIL APP PASSWORD)
const transporter = nodemailer.createTransport({
  service: "gmail",  // OR use SMTP host if needed
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If this email exists, a reset link was sent." });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');

    // Set token + expiry (1 hour)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetURL = `http://localhost:3000/reset-password/${token}`;

    // Send email
    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}">${resetURL}</a>
      `
    });

    res.json({ message: "Reset link sent to your email." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
