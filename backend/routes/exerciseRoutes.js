const express = require('express');
const router = express.Router();
const { protect, coach } = require('../middleware/authMiddleware');
const {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
} = require('../controllers/exerciseController');

// Exercise routes
router.get('/', protect, getExercises);
router.get('/:id', protect, getExerciseById);
router.post('/', protect, coach, createExercise);
router.put('/:id', protect, coach, updateExercise);
router.delete('/:id', protect, coach, deleteExercise);

module.exports = router; 