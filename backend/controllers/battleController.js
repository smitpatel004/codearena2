/**
 * Battle Controller
 * Handles head-to-head profile comparisons
 */

const Battle = require('../models/Battle');
const Profile = require('../models/Profile');
const User = require('../models/User');
const leetcodeService = require('../services/leetcodeService');
const codeforcesService = require('../services/codeforcesService');
const codechefService = require('../services/codechefService');
const { calculateSkillScore } = require('../utils/skillScore');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper: fetch stats for a set of usernames
const fetchPlayerStats = async ({ leetcodeUsername, codeforcesUsername, codechefUsername }) => {
  const [lc, cf, cc] = await Promise.allSettled([
    leetcodeUsername ? leetcodeService.getUserStats(leetcodeUsername) : Promise.resolve(null),
    codeforcesUsername ? codeforcesService.getUserStats(codeforcesUsername) : Promise.resolve(null),
    codechefUsername ? codechefService.getUserStats(codechefUsername) : Promise.resolve(null),
  ]);

  const leetcode = lc.status === 'fulfilled' ? lc.value : null;
  const codeforces = cf.status === 'fulfilled' ? cf.value : null;
  const codechef = cc.status === 'fulfilled' ? cc.value : null;
  const skillScore = calculateSkillScore(leetcode, codeforces, codechef);

  return { leetcode, codeforces, codechef, skillScore };
};

// @desc    Create a new battle
// @route   POST /api/battle
// @access  Private
const createBattle = async (req, res, next) => {
  try {
    const { player1, player2 } = req.body;

    if (!player1 || !player2) {
      return errorResponse(res, 'Both player1 and player2 are required', 400);
    }

    // Fetch both players' stats in parallel
    const [p1Stats, p2Stats] = await Promise.all([
      fetchPlayerStats(player1),
      fetchPlayerStats(player2),
    ]);

    const score1 = p1Stats.skillScore;
    const score2 = p2Stats.skillScore;
    const winner = score1 > score2 ? 'player1' : score2 > score1 ? 'player2' : 'tie';

    const battle = await Battle.create({
      initiatorId: req.user._id,
      player1: {
        username: player1.displayName || player1.leetcodeUsername || player1.codeforcesUsername || 'Player 1',
        ...player1,
      },
      player2: {
        username: player2.displayName || player2.leetcodeUsername || player2.codeforcesUsername || 'Player 2',
        ...player2,
      },
      score1,
      score2,
      winner,
      stats: { player1Stats: p1Stats, player2Stats: p2Stats },
    });

    return successResponse(res, 'Battle completed!', {
      battleId: battle._id,
      player1: { ...player1, stats: p1Stats, score: score1 },
      player2: { ...player2, stats: p2Stats, score: score2 },
      winner,
      createdAt: battle.createdAt,
    }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get battle history for logged-in user
// @route   GET /api/battle/history
// @access  Private
const getBattleHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [battles, total] = await Promise.all([
      Battle.find({ initiatorId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Battle.countDocuments({ initiatorId: req.user._id }),
    ]);

    return successResponse(res, 'Battle history fetched', battles, {
      page, limit, total, pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single battle
// @route   GET /api/battle/:id
// @access  Private
const getBattle = async (req, res, next) => {
  try {
    const battle = await Battle.findById(req.params.id);
    if (!battle) return errorResponse(res, 'Battle not found', 404);
    return successResponse(res, 'Battle fetched', battle);
  } catch (error) {
    next(error);
  }
};

module.exports = { createBattle, getBattleHistory, getBattle };
