const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  name: String,
  issuer: String,
  dateObtained: Date,
  expiryDate: Date,
  verificationUrl: String
});

const coachSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(adminId) {
        const admin = await mongoose.model('User').findById(adminId);
        return admin && admin.roles.includes('admin');
      },
      message: 'Admin ID must reference a user with admin role'
    }
  },
  profile: {
    specialization: String,
    bio: String,
    yearsExperience: Number,
    certifications: [certificationSchema],
  },
  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Coach', coachSchema); 