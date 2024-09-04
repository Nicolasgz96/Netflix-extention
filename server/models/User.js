const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Generate a salt and hash the password
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare a candidate password with the user's hashed password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
module.exports = mongoose.model('User', UserSchema);

// TODO: Add more user-related fields (e.g., name, profile picture)
// TODO: Implement password reset token field and methods
// TODO: Add method to generate JWT token for the user
// TODO: Consider adding a role field for user permissions
// TODO: Implement email verification status and token