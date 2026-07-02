/**
 * Authentication Controller
 * Handles register, login, logout, and getMe
 */

const User = require('../models/User');
const Profile = require('../models/Profile');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 400);
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Auto-create empty profile
    await Profile.create({ userId: user._id });

    const token = user.generateJWT();

    return successResponse(res, 'Account created successfully', {
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const token = user.generateJWT();

    return successResponse(res, 'Login successful', {
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const profile = await Profile.findOne({ userId: req.user._id });

    return successResponse(res, 'User fetched successfully', {
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      profile: profile || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user account
// @route   PUT /api/auth/update
// @access  Private
const updateAccount = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    );
    return successResponse(res, 'Account updated', {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateAccount, changePassword };
