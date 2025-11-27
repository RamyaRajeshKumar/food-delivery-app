const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String }, // Not required for social logins
  phone: { type: String },
  refreshToken: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },

  // RESET PASSWORD FIELDS
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
