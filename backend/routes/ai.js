const express = require('express');
const router = express.Router();
const { analyzeProfile } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/analyze', protect, analyzeProfile);

module.exports = router;
