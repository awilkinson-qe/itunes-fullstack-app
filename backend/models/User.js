// User.js - Mongoose model for user accounts
// Defines the structure for application users stored in MongoDB.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Public username shown in the UI
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
    },

    // Email used for login and account identification
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },

    // Stored as a hashed password, never plain text
    password: {
      type: String,
      required: true,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);