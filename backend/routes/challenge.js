const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createChallenge,
  acceptChallenge,
  declineChallenge,
  cancelChallenge,
  submitSolution,
  giveUp,
  getChallenge,
  getMyChallenges,
  getPendingChallenges,
} = require('../controllers/challengeController');

// All routes require auth
router.use(protect);

// Create a challenge
router.post('/', createChallenge);

// Get pending (incoming) challenges — must be before /:id
router.get('/pending', getPendingChallenges);

// Get my challenges (sent + received)
router.get('/my', getMyChallenges);

// Get single challenge
router.get('/:id', getChallenge);

// Accept a challenge
router.post('/:id/accept', acceptChallenge);

// Decline a challenge
router.post('/:id/decline', declineChallenge);

// Cancel a challenge
router.post('/:id/cancel', cancelChallenge);

// Submit solution
router.post('/:id/submit', submitSolution);

// Give up / forfeit
router.post('/:id/giveup', giveUp);

module.exports = router;
