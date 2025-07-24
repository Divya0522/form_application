const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.get('/me', protect, getMe);
router.put('/update', protect, updateProfile);

module.exports = router;