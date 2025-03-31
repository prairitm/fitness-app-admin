const Exercise = require('../models/exerciseModel');

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Private
const getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find({ active: true })
      .populate('createdBy', 'firstName lastName');
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get exercise by ID
// @route   GET /api/exercises/:id
// @access  Private
const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new exercise
// @route   POST /api/exercises
// @access  Private (Coach)
const createExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create({
      ...req.body,
      createdBy: req.user._id
    });
    
    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private (Coach)
const updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    const updatedExercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('createdBy', 'firstName lastName');

    res.json(updatedExercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete exercise (soft delete)
// @route   DELETE /api/exercises/:id
// @access  Private (Coach)
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    exercise.active = false;
    await exercise.save();

    res.json({ message: 'Exercise removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
}; 