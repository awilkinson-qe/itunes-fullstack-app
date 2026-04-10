// authRoutes.js - Defines routes for user authentication
// Handles registration, login, and fetching the current user.
// Applies rate limiting to sensitive endpoints to reduce brute-force attacks.

const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ===== RATE LIMITING =====

// Apply stricter limits to login/register endpoints only
// Prevents abuse while keeping normal app usage unaffected
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // higher limit to avoid dev friction
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

// ===== ROUTES =====

// Register a new user
router.post("/register", authLimiter, registerUser);

// Log in an existing user
router.post("/login", authLimiter, loginUser);

// Get currently authenticated user's profile
// Protected route (requires valid JWT)
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;