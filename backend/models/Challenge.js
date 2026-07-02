const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    challengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    opponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'active', 'completed', 'cancelled', 'expired'],
      default: 'pending',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    timeLimit: {
      type: Number, // in minutes: 10, 20, 30
      required: true,
    },
    problem: {
      questionId: String,
      questionFrontendId: String,
      title: String,
      titleSlug: String,
      difficulty: String,
      content: String,
      topicTags: [String],
      leetcodeUrl: String,
    },
    // Timer management
    startedAt: Date,
    endsAt: Date,
    // Submission tracking
    challengerSubmission: {
      submittedAt: Date,
      leetcodeSubmissionUrl: String,
      verified: { type: Boolean, default: false },
    },
    opponentSubmission: {
      submittedAt: Date,
      leetcodeSubmissionUrl: String,
      verified: { type: Boolean, default: false },
    },
    // Result
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    result: {
      type: String,
      enum: ['challenger_win', 'opponent_win', 'draw', 'timeout', null],
      default: null,
    },
    // Log
    events: [
      {
        event: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        data: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

challengeSchema.index({ challengerId: 1, status: 1 });
challengeSchema.index({ opponentId: 1, status: 1 });
challengeSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Challenge', challengeSchema);
