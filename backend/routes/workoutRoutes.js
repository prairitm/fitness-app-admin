const express = require('express');
const router = express.Router();
const { protect, coach } = require('../middleware/authMiddleware');
const {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  completeWorkout
} = require('../controllers/workoutController');

// Workout management endpoints
router.post('/', protect, coach, createWorkout);
router.get('/', protect, getWorkouts);
router.get('/:id', protect, getWorkoutById);
router.put('/:id', protect, coach, updateWorkout);
router.delete('/:id', protect, coach, deleteWorkout);
router.post('/:id/complete', protect, completeWorkout);

module.exports = router; 