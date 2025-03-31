const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers } = require('../controllers/userController');

// Public routes
router.post('/', registerUser);
router.post('/login', loginUser);

// Private route
router.get('/', getUsers);

module.exports = router; 