const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { getRandomProblem } = require('../services/leetcodeProblemService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

// ── Validate LeetCode submission URL ──
const isValidLeetCodeUrl = (url) => {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'leetcode.com' &&
      (parsed.pathname.startsWith('/submissions/') ||
       parsed.pathname.startsWith('/problems/'))
    );
  } catch {
    return false;
  }
};

// ── Create Challenge ──
const createChallenge = async (req, res, next) => {
  try {
    const { opponentId, difficulty, timeLimit } = req.body;

    if (!opponentId || !difficulty || !timeLimit) {
      return errorResponse(res, 'opponentId, difficulty, and timeLimit are required', 400);
    }

    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return errorResponse(res, 'Difficulty must be Easy, Medium, or Hard', 400);
    }

    if (![10, 20, 30].includes(timeLimit)) {
      return errorResponse(res, 'Time limit must be 10, 20, or 30 minutes', 400);
    }

    if (req.user._id.toString() === opponentId) {
      return errorResponse(res, 'You cannot challenge yourself', 400);
    }

    const opponent = await User.findById(opponentId);
    if (!opponent) {
      return errorResponse(res, 'Opponent not found', 404);
    }

    // Check for existing pending/active challenge between same users (both directions)
    const existing = await Challenge.findOne({
      $or: [
        { challengerId: req.user._id, opponentId, status: { $in: ['pending', 'accepted', 'active'] } },
        { challengerId: opponentId, opponentId: req.user._id, status: { $in: ['pending', 'accepted', 'active'] } },
      ],
    });
    if (existing) {
      return errorResponse(res, 'An active or pending challenge already exists between you', 409);
    }

    const challenge = await Challenge.create({
      challengerId: req.user._id,
      opponentId,
      difficulty,
      timeLimit,
      status: 'pending',
    });

    await challenge.populate('challengerId', 'name email');
    await challenge.populate('opponentId', 'name email');

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${opponentId}`).emit('challenge:new', {
        challengeId: challenge._id,
        challenger: { id: req.user._id.toString(), name: req.user.name },
        difficulty,
        timeLimit,
      });
    }

    return successResponse(res, 'Challenge sent', challenge, 201);
  } catch (err) {
    next(err);
  }
};

// ── Accept Challenge ──
const acceptChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;

    const challenge = await Challenge.findOne({
      _id: id,
      opponentId: req.user._id,
      status: 'pending',
    });

    if (!challenge) {
      return errorResponse(res, 'Challenge not found or already handled', 404);
    }

    const problem = await getRandomProblem(challenge.difficulty);

    challenge.status = 'active';
    challenge.problem = problem;
    challenge.startedAt = new Date();
    challenge.endsAt = new Date(Date.now() + challenge.timeLimit * 60 * 1000);
    challenge.events.push({
      event: 'accepted',
      userId: req.user._id,
      timestamp: new Date(),
    });

    await challenge.save();
    await challenge.populate('challengerId', 'name email');
    await challenge.populate('opponentId', 'name email');

    const io = req.app.get('io');
    if (io) {
      // Notify challenger that opponent accepted
      io.to(`user:${challenge.challengerId._id}`).emit('challenge:accepted', {
        challengeId: challenge._id,
        opponent: { id: req.user._id.toString(), name: req.user.name },
        problem: {
          title: problem.title,
          difficulty: problem.difficulty,
          leetcodeUrl: problem.leetcodeUrl,
        },
        endsAt: challenge.endsAt,
      });

      // Emit updated challenge to both users so arena updates in real-time
      io.to(`user:${challenge.challengerId._id}`).emit('challenge:updated', { challenge });
      io.to(`user:${req.user._id}`).emit('challenge:updated', { challenge });
    }

    return successResponse(res, 'Challenge accepted — battle begins!', challenge);
  } catch (err) {
    next(err);
  }
};

// ── Decline Challenge ──
const declineChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;

    const challenge = await Challenge.findOne({
      _id: id,
      opponentId: req.user._id,
      status: 'pending',
    });

    if (!challenge) {
      return errorResponse(res, 'Challenge not found or already handled', 404);
    }

    challenge.status = 'declined';
    challenge.events.push({ event: 'declined', userId: req.user._id, timestamp: new Date() });
    await challenge.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${challenge.challengerId}`).emit('challenge:declined', {
        challengeId: challenge._id,
        opponent: { id: req.user._id.toString(), name: req.user.name },
      });
    }

    return successResponse(res, 'Challenge declined');
  } catch (err) {
    next(err);
  }
};

// ── Cancel Challenge ──
const cancelChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;

    const challenge = await Challenge.findOne({
      _id: id,
      challengerId: req.user._id,
      status: 'pending',
    });

    if (!challenge) {
      return errorResponse(res, 'Challenge not found or already handled', 404);
    }

    challenge.status = 'cancelled';
    challenge.events.push({ event: 'cancelled', userId: req.user._id, timestamp: new Date() });
    await challenge.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${challenge.opponentId}`).emit('challenge:cancelled', {
        challengeId: challenge._id,
      });
    }

    return successResponse(res, 'Challenge cancelled');
  } catch (err) {
    next(err);
  }
};

// ── Submit Solution ──
const submitSolution = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { leetcodeSubmissionUrl, solutionCode } = req.body;

    if (!leetcodeSubmissionUrl) {
      return errorResponse(res, 'leetcodeSubmissionUrl is required', 400);
    }

    // Basic URL validation
    if (!isValidLeetCodeUrl(leetcodeSubmissionUrl)) {
      return errorResponse(
        res,
        'Please provide a valid LeetCode submission URL (https://leetcode.com/submissions/...)',
        400
      );
    }

    const userId = req.user._id.toString();

    // Find challenge — allow active OR completed (for second submitter)
    const challenge = await Challenge.findOne({
      _id: id,
      $or: [{ challengerId: req.user._id }, { opponentId: req.user._id }],
      status: { $in: ['active', 'completed'] },
    });

    if (!challenge) {
      return errorResponse(res, 'Challenge not found or has expired', 404);
    }

    const isChallenger = challenge.challengerId.toString() === userId;
    const submissionField = isChallenger ? 'challengerSubmission' : 'opponentSubmission';
    const otherField = isChallenger ? 'opponentSubmission' : 'challengerSubmission';

    // Check if THIS user already submitted
    const myExisting = challenge[submissionField];
    if (myExisting && myExisting.submittedAt) {
      return errorResponse(res, 'You have already submitted your solution for this challenge', 400);
    }

    const now = new Date();

    // Record this user's submission
    challenge[submissionField] = {
      submittedAt: now,
      leetcodeSubmissionUrl: leetcodeSubmissionUrl.trim(),
      solutionCode: solutionCode ? solutionCode.trim() : '',
      verified: false,
    };

    challenge.events.push({
      event: 'submitted',
      userId: req.user._id,
      timestamp: now,
      data: { leetcodeSubmissionUrl: leetcodeSubmissionUrl.trim() },
    });

    // Determine result
    const otherSubmission = challenge[otherField];

    if (!otherSubmission || !otherSubmission.submittedAt) {
      // First to submit — they're the winner
      challenge.winner = req.user._id;
      challenge.result = isChallenger ? 'challenger_win' : 'opponent_win';
    } else {
      // Both submitted — compare timestamps
      const myTime = now.getTime();
      const otherTime = otherSubmission.submittedAt.getTime();

      if (myTime < otherTime) {
        challenge.winner = req.user._id;
        challenge.result = isChallenger ? 'challenger_win' : 'opponent_win';
      } else if (otherTime < myTime) {
        challenge.winner = isChallenger ? challenge.opponentId : challenge.challengerId;
        challenge.result = isChallenger ? 'opponent_win' : 'challenger_win';
      } else {
        // Exact same time (extremely unlikely)
        challenge.result = 'draw';
      }
    }

    // If BOTH have submitted, or timer expired, complete the challenge.
    // Otherwise keep it active so the other person can still submit.
    if (otherSubmission?.submittedAt) {
      // Both submitted — challenge is fully resolved
      challenge.status = 'completed';
    }
    // If only one has submitted, keep challenge active so other can still submit.
    // Winner is recorded but status stays 'active' until both submit or time expires.

    challenge.events.push({
      event: 'winner_determined',
      userId: challenge.winner,
      timestamp: now,
      data: { reason: otherSubmission?.submittedAt ? 'both_submitted' : 'first_submission' },
    });

    await challenge.save();
    await challenge.populate('challengerId', 'name email');
    await challenge.populate('opponentId', 'name email');
    await challenge.populate('winner', 'name email');

    // Notify both users via socket
    const io = req.app.get('io');
    if (io) {
      const otherUserId = isChallenger
        ? challenge.opponentId._id.toString()
        : challenge.challengerId._id.toString();

      io.to(`user:${userId}`).emit('challenge:updated', { challenge });
      io.to(`user:${otherUserId}`).emit('challenge:updated', { challenge });
    }

    return successResponse(res, 'Solution submitted!', challenge);
  } catch (err) {
    next(err);
  }
};

// ── Check/expire a challenge ──
const checkExpired = async (req, res, next) => {
  try {
    const { id } = req.params;
    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return errorResponse(res, 'Challenge not found', 404);
    }

    if (challenge.status === 'active' && challenge.endsAt && new Date() > challenge.endsAt) {
      challenge.status = 'expired';
      challenge.result = 'timeout';
      challenge.events.push({ event: 'expired', timestamp: new Date() });
      await challenge.save();

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${challenge.challengerId}`).emit('challenge:updated', { challenge });
        io.to(`user:${challenge.opponentId}`).emit('challenge:updated', { challenge });
      }
    }

    return successResponse(res, 'Challenge status', challenge);
  } catch (err) {
    next(err);
  }
};

// ── Get Single Challenge ──
const getChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('challengerId', 'name email')
      .populate('opponentId', 'name email')
      .populate('winner', 'name email');

    if (!challenge) {
      return errorResponse(res, 'Challenge not found', 404);
    }

    const userId = req.user._id.toString();
    if (
      challenge.challengerId._id.toString() !== userId &&
      challenge.opponentId._id.toString() !== userId
    ) {
      return errorResponse(res, 'Not authorized', 403);
    }

    // Auto-expire if needed
    if (challenge.status === 'active' && challenge.endsAt && new Date() > challenge.endsAt) {
      challenge.status = 'expired';
      challenge.result = 'timeout';
      challenge.events.push({ event: 'expired', timestamp: new Date() });
      await challenge.save();
    }

    return successResponse(res, 'Challenge details', challenge);
  } catch (err) {
    next(err);
  }
};

// ── List My Challenges ──
const getMyChallenges = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {
      $or: [{ challengerId: req.user._id }, { opponentId: req.user._id }],
    };
    if (status) query.status = status;

    const challenges = await Challenge.find(query)
      .populate('challengerId', 'name email')
      .populate('opponentId', 'name email')
      .populate('winner', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Challenge.countDocuments(query);

    return paginatedResponse(res, 'Challenges retrieved', challenges, {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// ── Get Pending (Incoming) Challenges ──
const getPendingChallenges = async (req, res, next) => {
  try {
    const challenges = await Challenge.find({
      opponentId: req.user._id,
      status: 'pending',
    })
      .populate('challengerId', 'name email')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Pending challenges', challenges);
  } catch (err) {
    next(err);
  }
};

// ── Give Up / Forfeit ──
const giveUp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const challenge = await Challenge.findOne({
      _id: id,
      status: 'active',
      $or: [{ challengerId: req.user._id }, { opponentId: req.user._id }],
    });

    if (!challenge) {
      return errorResponse(res, 'No active challenge found', 404);
    }

    const isChallenger = challenge.challengerId.toString() === userId;

    // The other person wins by forfeit
    challenge.winner = isChallenger ? challenge.opponentId : challenge.challengerId;
    challenge.result = isChallenger ? 'opponent_win' : 'challenger_win';
    challenge.status = 'completed';
    challenge.events.push({
      event: 'give_up',
      userId: req.user._id,
      timestamp: new Date(),
      data: { forfeitedBy: isChallenger ? 'challenger' : 'opponent' },
    });

    await challenge.save();
    await challenge.populate('challengerId', 'name email');
    await challenge.populate('opponentId', 'name email');
    await challenge.populate('winner', 'name email');

    const io = req.app.get('io');
    if (io) {
      const otherUserId = isChallenger
        ? challenge.opponentId._id.toString()
        : challenge.challengerId._id.toString();

      io.to(`user:${userId}`).emit('challenge:updated', { challenge });
      io.to(`user:${otherUserId}`).emit('challenge:updated', { challenge });
    }

    return successResponse(res, 'You gave up — opponent wins by forfeit', challenge);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createChallenge,
  acceptChallenge,
  declineChallenge,
  cancelChallenge,
  submitSolution,
  giveUp,
  checkExpired,
  getChallenge,
  getMyChallenges,
  getPendingChallenges,
};
