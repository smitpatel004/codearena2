/**
 * AI Controller — Gemini profile analysis
 */
const geminiService = require('../services/geminiService');
const Profile = require('../models/Profile');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const analyzeProfile = async (req, res, next) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return errorResponse(res, 'AI analysis is not configured. Please add GEMINI_API_KEY.', 503);
    }

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return errorResponse(res, 'Profile not found', 404);

    const stats = {
      leetcode: profile.leetcodeStats,
      codeforces: profile.codeforcesStats,
      codechef: profile.codechefStats,
      skillScore: profile.skillScore,
    };

    const analysis = await geminiService.analyzeProfile(stats);
    return successResponse(res, 'AI analysis complete', analysis);
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeProfile };
