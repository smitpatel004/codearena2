/**
 * Leaderboard Controller
 */
const Profile = require('../models/Profile');
const User = require('../models/User');
const { successResponse } = require('../utils/apiResponse');

const getLeaderboard = async (req, res, next) => {
  try {
    const profiles = await Profile.find({ skillScore: { $gt: 0 } })
      .sort({ skillScore: -1 })
      .limit(50)
      .populate('userId', 'name email createdAt');

    const leaderboard = profiles.map((p, i) => ({
      rank: i + 1,
      userId: p.userId?._id,
      name: p.userId?.name || 'Unknown',
      email: p.userId?.email,
      skillScore: p.skillScore,
      totalSolved: p.leetcodeStats?.totalSolved || 0,
      cfRating: p.codeforcesStats?.currentRating || 0,
      ccRating: p.codechefStats?.currentRating || 0,
      connectedPlatforms: [
        p.leetcodeUsername ? 'leetcode' : null,
        p.codeforcesUsername ? 'codeforces' : null,
        p.codechefUsername ? 'codechef' : null,
      ].filter(Boolean),
    }));

    return successResponse(res, 'Leaderboard fetched', leaderboard);
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard };
