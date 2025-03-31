const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getProfile, 
  updateProfile,
  logoutUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Auth endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logoutUser);

module.exports = router; 