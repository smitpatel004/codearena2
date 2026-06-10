const express = require('express');
const router = express.Router();
const { createBattle, getBattleHistory, getBattle } = require('../controllers/battleController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBattle);
router.get('/history', protect, getBattleHistory);
router.get('/:id', protect, getBattle);

module.exports = router;
