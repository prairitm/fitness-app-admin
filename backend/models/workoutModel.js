const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  metrics: [{
    type: String
  }],
  videoUrl: String,
  sets: Number,
  reps: Number,
  weight: Number,
  duration: Number, // in seconds, for timed exercises
  restPeriod: Number // in seconds
});

const exerciseSectionSchema = new mongoose.Schema({
  sectionLetter: {
    type: String,
    required: true
  },
  exercises: [exerciseSchema],
  order: {
    type: Number,
    required: true
  }
});

const workoutSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true
  },
  title: {
    type: String,
  },
  date: {
    type: Date,
    required: true
  },
  warmupNote: {
    type: String,
    default: ''
  },
  exerciseSections: [exerciseSectionSchema],
  cooldownNote: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Workout', workoutSchema); 