/**
 * Profile Model
 * Stores connected platform usernames for a user
 */

const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    leetcodeUsername: {
      type: String,
      trim: true,
      default: ''
    },
    codeforcesUsername: {
      type: String,
      trim: true,
      default: ''
    },
    codechefUsername: {
      type: String,
      trim: true,
      default: ''
    },
    // Cached platform stats (updated on dashboard refresh)
    leetcodeStats: {
      totalSolved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      contestRating: { type: Number, default: 0 },
      ranking: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: null }
    },
    codeforcesStats: {
      currentRating: { type: Number, default: 0 },
      maxRating: { type: Number, default: 0 },
      rank: { type: String, default: '' },
      maxRank: { type: String, default: '' },
      lastUpdated: { type: Date, default: null }
    },
    codechefStats: {
      currentRating: { type: Number, default: 0 },
      highestRating: { type: Number, default: 0 },
      stars: { type: String, default: '' },
      lastUpdated: { type: Date, default: null }
    },
    // Computed skill score 0-100
    skillScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Profile', ProfileSchema);
