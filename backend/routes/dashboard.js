const express = require('express');
const router = express.Router();
const { getDashboard, fetchForUsername } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDashboard);
router.post('/fetch', protect, fetchForUsername);

module.exports = router;
