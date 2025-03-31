const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  weight: {
    type: Number
  },
  bodyFatPercentage: {
    type: Number
  },
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number
  },
  notes: String
}, { timestamps: true });

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true,
    // validate: {
    //   validator: async function(userId) {
    //     const user = await mongoose.model('User').findById(userId);
    //     return user && user.roles.includes('client');
    //   },
    //   message: 'User ID must reference a user with client role'
    // }
  },
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true,
    validate: {
      validator: async function(coachId) {
        const coach = await mongoose.model('Coach').findById(coachId);
        return coach && coach.active;
      },
      message: 'Coach ID must reference an active coach'
    }
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  profile: {
    dateOfBirth: Date,
    height: Number,  // in cm
    weight: Number,  // in kg
    fitnessGoal: String,
    medicalConditions: [String]
  },
  progressHistory: [progressSchema],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', clientSchema); 