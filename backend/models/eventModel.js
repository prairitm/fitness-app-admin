const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['workout', 'meeting', 'assessment', 'other'],
    default: 'workout'
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  description: String,
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema); 