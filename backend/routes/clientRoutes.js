const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getClientWorkouts,
  getClientById,
  getClientByEmail,
  updateClient,
  addProgress,
  getClientProgress,
  getClientDashboard
} = require('../controllers/clientController');

// Client endpoints
router.get('/:id/workouts', protect, getClientWorkouts);
router.get('/email/:email', protect, getClientByEmail);
router.get('/:id', protect, getClientById);
router.put('/:id', protect, updateClient);
router.post('/:id/progress', protect, addProgress);
router.get('/progress', protect, getClientProgress);
router.get('/dashboard', protect, getClientDashboard);

module.exports = router; 