/**
 * Profile Controller
 * Manages connected platform usernames
 */

const Profile = require('../models/Profile');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await Profile.create({ userId: req.user._id });
    }
    return successResponse(res, 'Profile fetched', profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Update connected platform usernames
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { leetcodeUsername, codeforcesUsername, codechefUsername } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      {
        ...(leetcodeUsername !== undefined && { leetcodeUsername }),
        ...(codeforcesUsername !== undefined && { codeforcesUsername }),
        ...(codechefUsername !== undefined && { codechefUsername }),
      },
      { new: true, upsert: true, runValidators: true }
    );

    return successResponse(res, 'Profile updated successfully', profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Get public profile by userId
// @route   GET /api/profile/:userId
// @access  Public
const getPublicProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) {
      return errorResponse(res, 'Profile not found', 404);
    }
    return successResponse(res, 'Profile fetched', profile);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getPublicProfile };
