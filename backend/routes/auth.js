const express = require('express');
const router = express.Router();
const { register, login, getMe, updateAccount, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update', protect, updateAccount);
router.put('/change-password', protect, changePassword);

module.exports = router;
