const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'balance', 'sport-specific'],
    required: true
  },
  equipment: [{
    type: String
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  muscleGroups: [{
    type: String
  }],
  videoUrl: String,
  images: [{
    url: String,
    description: String
  }],
  instructions: [{
    step: Number,
    description: String
  }],
  variations: [{
    name: String,
    description: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exercise', exerciseSchema); 