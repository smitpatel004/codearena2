/**
 * Friend Model
 * Stores friend relationships between users
 */

const mongoose = require('mongoose');

const FriendSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    friendId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'accepted'
    }
  },
  {
    timestamps: true
  }
);

// Ensure no duplicate friend relationships
FriendSchema.index({ userId: 1, friendId: 1 }, { unique: true });

module.exports = mongoose.model('Friend', FriendSchema);
