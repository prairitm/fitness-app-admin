const Workout = require('../models/workoutModel');
const Client = require('../models/clientModel');

// @desc    Get all workouts
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find()
      .populate('clientId', 'firstName lastName')
      .populate('coachId', 'firstName lastName')
      .sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get workout by ID
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('clientId', 'firstName lastName')
      .populate('coachId', 'firstName lastName');

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Transform the response to match frontend expectations
    const transformedWorkout = {
      ...workout.toObject(),
      exercises: (workout.exerciseSections || []).map(section => ({
        id: section._id,
        letter: section.sectionLetter,
        title: section.exercises?.[0]?.title || '',
        videoUrl: section.exercises?.[0]?.videoUrl || '',
        notes: section.exercises?.[0]?.metrics?.[0] || '',
        sets: section.exercises?.[0]?.sets || null,
        reps: section.exercises?.[0]?.reps || null,
        weight: section.exercises?.[0]?.weight || null,
        duration: section.exercises?.[0]?.duration || null,
        restPeriod: section.exercises?.[0]?.restPeriod || null
      })),
      warmup: workout.warmupNote || '',
      cooldown: workout.cooldownNote || ''
    };

    res.json(transformedWorkout);
  } catch (error) {
    console.error('Error getting workout:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private (Coach)
const createWorkout = async (req, res) => {
  try {
    const {
      title,
      date,
      warmup,
      exercises,
      cooldown,
      clientId,
      type,
      description
    } = req.body;

    // Transform exercises into exerciseSections format
    const exerciseSections = exercises.map((exercise, index) => ({
      sectionLetter: exercise.letter,
      exercises: [{
        title: exercise.title,
        videoUrl: exercise.videoUrl || '',
        metrics: exercise.notes ? [exercise.notes] : [],
        sets: null,
        reps: null,
        weight: null,
        duration: null,
        restPeriod: null
      }],
      order: index + 1
    }));

    const workout = await Workout.create({
      title: title || 'Untitled Workout',
      date: new Date(date),
      warmupNote: warmup || '',
      exerciseSections,
      cooldownNote: cooldown || '',
      clientId,
      coachId: req.user._id,
      completed: false,
      type: type || 'workout',
      description: description || ''
    });

    // Transform the response to match frontend expectations
    const transformedWorkout = {
      ...workout.toObject(),
      exercises: workout.exerciseSections.map(section => ({
        id: section._id,
        letter: section.sectionLetter,
        title: section.exercises[0]?.title || '',
        videoUrl: section.exercises[0]?.videoUrl || '',
        notes: section.exercises[0]?.metrics?.[0] || '',
      })),
      warmup: workout.warmupNote,
      cooldown: workout.cooldownNote
    };

    res.status(201).json(transformedWorkout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private (Coach)
const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      date,
      warmupNote,
      cooldownNote,
      exerciseSections,
      type,
      description
    } = req.body;

    // First get the existing workout to preserve values
    const existingWorkout = await Workout.findById(id);
    if (!existingWorkout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Update the workout with new values
    const workout = await Workout.findByIdAndUpdate(
      id,
      {
        title: title || existingWorkout.title,
        date: date ? new Date(date) : existingWorkout.date,
        warmupNote: warmupNote !== undefined ? warmupNote : existingWorkout.warmupNote,
        exerciseSections: exerciseSections || existingWorkout.exerciseSections,
        cooldownNote: cooldownNote !== undefined ? cooldownNote : existingWorkout.cooldownNote,
        type: type || existingWorkout.type,
        description: description !== undefined ? description : existingWorkout.description,
        clientId: existingWorkout.clientId,
        coachId: existingWorkout.coachId
      },
      { new: true }
    );

    // Transform the response to match frontend expectations
    const transformedWorkout = {
      ...workout.toObject(),
      exercises: (workout.exerciseSections || []).map(section => ({
        id: section._id,
        letter: section.sectionLetter,
        title: section.exercises?.[0]?.title || '',
        videoUrl: section.exercises?.[0]?.videoUrl || '',
        notes: section.exercises?.[0]?.metrics?.[0] || '',
        sets: section.exercises?.[0]?.sets || null,
        reps: section.exercises?.[0]?.reps || null,
        weight: section.exercises?.[0]?.weight || null,
        duration: section.exercises?.[0]?.duration || null,
        restPeriod: section.exercises?.[0]?.restPeriod || null
      })),
      warmup: workout.warmupNote || '',
      cooldown: workout.cooldownNote || ''
    };

    res.json(transformedWorkout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private (Coach)
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    await workout.deleteOne();
    res.json({ message: 'Workout removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete workout
// @route   POST /api/workouts/:id/complete
// @access  Private
const completeWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    workout.completed = true;
    workout.completedAt = new Date();
    await workout.save();

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get client's workouts
// @route   GET /api/workouts/client/:clientId
// @access  Private
const getClientWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ clientId: req.params.clientId })
      .sort({ date: 1 });
    res.json(workouts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  completeWorkout,
  getClientWorkouts
}; 