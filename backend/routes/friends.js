const express = require('express');
const router = express.Router();
const { addFriend, removeFriend, getFriends } = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFriends);
router.post('/', protect, addFriend);
router.delete('/:friendId', protect, removeFriend);

module.exports = router;
