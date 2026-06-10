/**
 * Dashboard Controller
 * Fetches live stats from all connected platforms
 */

const Profile = require('../models/Profile');
const leetcodeService = require('../services/leetcodeService');
const codeforcesService = require('../services/codeforcesService');
const codechefService = require('../services/codechefService');
const { calculateSkillScore } = require('../utils/skillScore');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Fetch all platform stats for logged-in user
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return errorResponse(res, 'Profile not found. Please set up your profile first.', 404);

    const results = { leetcode: null, codeforces: null, codechef: null };
    const errors = {};

    // Fetch all platforms in parallel
    const [lcResult, cfResult, ccResult] = await Promise.allSettled([
      profile.leetcodeUsername ? leetcodeService.getUserStats(profile.leetcodeUsername) : Promise.resolve(null),
      profile.codeforcesUsername ? codeforcesService.getUserStats(profile.codeforcesUsername) : Promise.resolve(null),
      profile.codechefUsername ? codechefService.getUserStats(profile.codechefUsername) : Promise.resolve(null),
    ]);

    if (lcResult.status === 'fulfilled') results.leetcode = lcResult.value;
    else errors.leetcode = lcResult.reason?.message;

    if (cfResult.status === 'fulfilled') results.codeforces = cfResult.value;
    else errors.codeforces = cfResult.reason?.message;

    if (ccResult.status === 'fulfilled') results.codechef = ccResult.value;
    else errors.codechef = ccResult.reason?.message;

    // Calculate skill score
    const skillScore = calculateSkillScore(results.leetcode, results.codeforces, results.codechef);

    // Cache stats in profile
    const updateData = { skillScore };
    if (results.leetcode) {
      updateData.leetcodeStats = { ...results.leetcode, lastUpdated: new Date() };
    }
    if (results.codeforces) {
      updateData.codeforcesStats = { ...results.codeforces, lastUpdated: new Date() };
    }
    if (results.codechef) {
      updateData.codechefStats = { ...results.codechef, lastUpdated: new Date() };
    }
    await Profile.findOneAndUpdate({ userId: req.user._id }, updateData);

    return successResponse(res, 'Dashboard data fetched', {
      ...results,
      skillScore,
      connectedPlatforms: [
        profile.leetcodeUsername ? 'leetcode' : null,
        profile.codeforcesUsername ? 'codeforces' : null,
        profile.codechefUsername ? 'codechef' : null,
      ].filter(Boolean),
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch stats for any username (used by Battle Arena)
// @route   POST /api/dashboard/fetch
// @access  Private
const fetchForUsername = async (req, res, next) => {
  try {
    const { leetcodeUsername, codeforcesUsername, codechefUsername } = req.body;
    const results = { leetcode: null, codeforces: null, codechef: null };

    const [lcResult, cfResult, ccResult] = await Promise.allSettled([
      leetcodeUsername ? leetcodeService.getUserStats(leetcodeUsername) : Promise.resolve(null),
      codeforcesUsername ? codeforcesService.getUserStats(codeforcesUsername) : Promise.resolve(null),
      codechefUsername ? codechefService.getUserStats(codechefUsername) : Promise.resolve(null),
    ]);

    if (lcResult.status === 'fulfilled') results.leetcode = lcResult.value;
    if (cfResult.status === 'fulfilled') results.codeforces = cfResult.value;
    if (ccResult.status === 'fulfilled') results.codechef = ccResult.value;

    const skillScore = calculateSkillScore(results.leetcode, results.codeforces, results.codechef);

    return successResponse(res, 'Stats fetched', { ...results, skillScore });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, fetchForUsername };
