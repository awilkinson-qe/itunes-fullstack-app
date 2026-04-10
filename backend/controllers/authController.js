// authController.js - Handles user authentication and authorization
// Provides registration, login, and current user retrieval using JWT.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ===== HELPER =====

// Create a signed JWT for an authenticated user
// Token includes minimal identifying info (no sensitive data)
const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// ===== REGISTER =====

// Register a new user, hash password, and return token
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required.",
      });
    }

    // Normalise input (basic data hygiene)
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing user (username OR email)
    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists.",
      });
    }

    // Hash password before storing (security best practice)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user record
    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Generate token for immediate login experience
    const token = createToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// ===== LOGIN =====

// Authenticate existing user and return token
const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Validate required fields
    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/username and password are required.",
      });
    }

    const normalizedLogin = emailOrUsername.trim();

    // Find user by email OR username
    const user = await User.findOne({
      $or: [
        { email: normalizedLogin.toLowerCase() },
        { username: normalizedLogin },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Generate JWT
    const token = createToken(user);

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// ===== CURRENT USER =====

// Return the authenticated user's profile (excluding password)
const getCurrentUser = async (req, res) => {
  try {
    // req.user comes from authMiddleware (decoded JWT)
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get current user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};