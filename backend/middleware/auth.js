/**
 * JWT Authentication Middleware
 * Protects routes by verifying Bearer tokens
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized - no token provided', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return errorResponse(res, 'User not found', 401);
    }

    if (!req.user.isActive) {
      return errorResponse(res, 'Account is deactivated', 401);
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired, please login again', 401);
    }
    return errorResponse(res, 'Not authorized - invalid token', 401);
  }
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return errorResponse(res, 'Admin access required', 403);
};

module.exports = { protect, adminOnly };
