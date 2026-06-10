/**
 * Analytics Controller
 */
const Profile = require('../models/Profile');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getAnalytics = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return errorResponse(res, 'Profile not found', 404);

    const lc = profile.leetcodeStats;
    const cf = profile.codeforcesStats;
    const cc = profile.codechefStats;

    const difficultyDistribution = {
      labels: ['Easy', 'Medium', 'Hard'],
      data: [lc.easySolved || 0, lc.mediumSolved || 0, lc.hardSolved || 0],
    };

    const platformContribution = {
      labels: ['LeetCode', 'Codeforces', 'CodeChef'],
      data: [lc.totalSolved || 0, cf.currentRating ? 1 : 0, cc.currentRating ? 1 : 0],
    };

    const skillBreakdown = {
      labels: ['Problem Solving', 'Contest Performance', 'Consistency', 'Hard Problems', 'Platform Diversity'],
      data: [
        Math.min(Math.round((lc.totalSolved / 500) * 100), 100),
        Math.min(Math.round((cf.currentRating / 2400) * 100), 100),
        Math.min(Math.round(((lc.totalSolved + (cf.currentRating > 0 ? 50 : 0)) / 600) * 100), 100),
        Math.min(Math.round((lc.hardSolved / 100) * 100), 100),
        [lc.totalSolved > 0, cf.currentRating > 0, cc.currentRating > 0].filter(Boolean).length * 33,
      ],
    };

    return successResponse(res, 'Analytics fetched', {
      difficultyDistribution,
      platformContribution,
      skillBreakdown,
      ratingProgress: {
        codeforces: [], // populated from cached history
      },
      summary: {
        totalSolved: lc.totalSolved || 0,
        contestRating: lc.contestRating || 0,
        cfRating: cf.currentRating || 0,
        ccRating: cc.currentRating || 0,
        skillScore: profile.skillScore || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
