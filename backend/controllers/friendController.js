/**
 * Friend Controller
 */
const Friend = require('../models/Friend');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Add friend by email
const addFriend = async (req, res, next) => {
  try {
    const { email } = req.body;
    const friend = await User.findOne({ email: email.toLowerCase() });
    if (!friend) return errorResponse(res, 'User not found', 404);
    if (friend._id.toString() === req.user._id.toString())
      return errorResponse(res, 'You cannot add yourself', 400);

    const existing = await Friend.findOne({ userId: req.user._id, friendId: friend._id });
    if (existing) return errorResponse(res, 'Already in friend list', 400);

    await Friend.create({ userId: req.user._id, friendId: friend._id });
    return successResponse(res, `${friend.name} added to friends`, { friendId: friend._id, name: friend.name }, 201);
  } catch (error) {
    next(error);
  }
};

// Remove friend
const removeFriend = async (req, res, next) => {
  try {
    const result = await Friend.findOneAndDelete({ userId: req.user._id, friendId: req.params.friendId });
    if (!result) return errorResponse(res, 'Friend not found', 404);
    return successResponse(res, 'Friend removed');
  } catch (error) {
    next(error);
  }
};

// Get friends list with profiles
const getFriends = async (req, res, next) => {
  try {
    const friendships = await Friend.find({ userId: req.user._id }).populate('friendId', 'name email');
    const friendIds = friendships.map((f) => f.friendId?._id);
    const profiles = await Profile.find({ userId: { $in: friendIds } });

    const friends = friendships.map((f) => {
      const profile = profiles.find((p) => p.userId.toString() === f.friendId?._id?.toString());
      return {
        userId: f.friendId?._id,
        name: f.friendId?.name,
        email: f.friendId?.email,
        skillScore: profile?.skillScore || 0,
        leetcodeUsername: profile?.leetcodeUsername || '',
        codeforcesUsername: profile?.codeforcesUsername || '',
        codechefUsername: profile?.codechefUsername || '',
        totalSolved: profile?.leetcodeStats?.totalSolved || 0,
        since: f.createdAt,
      };
    });

    return successResponse(res, 'Friends fetched', friends);
  } catch (error) {
    next(error);
  }
};

module.exports = { addFriend, removeFriend, getFriends };
