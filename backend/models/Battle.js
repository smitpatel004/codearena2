/**
 * Battle Model
 * Stores head-to-head comparison battle results
 */

const mongoose = require('mongoose');

const BattleSchema = new mongoose.Schema(
  {
    // The user who initiated the battle
    initiatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    player1: {
      username: { type: String, required: true },
      leetcodeUsername: { type: String, default: '' },
      codeforcesUsername: { type: String, default: '' },
      codechefUsername: { type: String, default: '' },
    },
    player2: {
      username: { type: String, required: true },
      leetcodeUsername: { type: String, default: '' },
      codeforcesUsername: { type: String, default: '' },
      codechefUsername: { type: String, default: '' },
    },
    score1: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    score2: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    winner: {
      type: String,
      enum: ['player1', 'player2', 'tie'],
      required: true
    },
    // Detailed stats snapshot at time of battle
    stats: {
      player1Stats: { type: Object, default: {} },
      player2Stats: { type: Object, default: {} }
    }
  },
  {
    timestamps: true
  }
);

// Index for fast retrieval of user's battle history
BattleSchema.index({ initiatorId: 1, createdAt: -1 });

module.exports = mongoose.model('Battle', BattleSchema);
