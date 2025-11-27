const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// Request password reset
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Email not found" });

  // Create reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Save hashed version in DB
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // Create reset URL for frontend
  const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

  // Send email
  await sendEmail(user.email, "Password Reset", 
    `Click the link to reset your password: ${resetURL}`
  );

  res.json({ message: "Reset link sent to email" });
});

// Reset the password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // Save new password
  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: "Password has been reset successfully" });
});

module.exports = router;
