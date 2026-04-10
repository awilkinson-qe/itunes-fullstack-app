// authMiddleware.js - Protects routes by verifying JWT tokens
// Checks for a Bearer token in the Authorization header and,
// if valid, attaches the decoded user payload to req.user.

const jwt = require("jsonwebtoken");

// Middleware to protect private routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Ensure an Authorization header exists and follows Bearer format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Token missing.",
    });
  }

  // Extract token after "Bearer "
  const token = authHeader.split(" ")[1];

  try {
    // Verify token and attach decoded payload to request object
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;