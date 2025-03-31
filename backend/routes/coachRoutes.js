const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { 
  getAllCoaches, 
  addCoach, 
  getCoachById,
  updateCoach,
  getCoachClients,
  addClient
} = require('../controllers/coachController');

// Coach routes
router.get('/', protect, getAllCoaches);
router.post('/', protect, admin, addCoach);
router.get('/:id', protect, getCoachById);
router.put('/:id', protect, updateCoach);
router.get('/:id/clients', protect, getCoachClients);
router.post('/:id/clients', protect, addClient);

module.exports = router; 