const Coach = require('../models/coachModel');
const Client = require('../models/clientModel');
const User = require('../models/userModel');

// @desc    Get all coaches
// @route   GET /api/teams/coaches
// @access  Private (Admin)
const getCoaches = async (req, res) => {
  try {
    const coaches = await Coach.find()
      .populate('userId', 'firstName lastName email')
      .populate('clients');
    res.json(coaches);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add new coach
// @route   POST /api/teams/coaches
// @access  Private (Admin)
const addCoach = async (req, res) => {
  try {
    const { email, firstName, lastName, specialization, bio } = req.body;

    // Create user first
    const user = await User.create({
      email,
      firstName,
      lastName,
      roles: ['coach'],
      password: Math.random().toString(36).slice(-8), // Generate random password
    });

    // Create coach profile
    const coach = await Coach.create({
      userId: user._id,
      adminId: req.user._id,
      profile: {
        specialization,
        bio,
      },
    });

    res.status(201).json(coach);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add client to coach
// @route   POST /api/teams/coaches/:coachId/clients
// @access  Private (Admin/Coach)
const addClient = async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    
    // First check if coach exists
    const coach = await Coach.findById(req.params.coachId);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user first and ensure it's saved
    const user = await User.create({
      email,
      firstName,
      lastName,
      roles: ['client'],
      password: Math.random().toString(36).slice(-8),
    });

    console.log('Created user:', user);

    // Create client profile with the saved user's ID
    const clientData = {
      userId: user._id,
      coachId: coach._id,
      name: `${firstName} ${lastName}`,
      email: email,
      profile: {
        dateOfBirth: null,
        height: null,
        weight: null,
        fitnessGoal: '',
        medicalConditions: []
      }
    };

    console.log('Creating client with data:', clientData);

    const client = await Client.create(clientData);
    console.log('Created client:', client);

    // Add client to coach's clients array
    coach.clients.push(client._id);
    await coach.save();

    // Return the created client with populated user data
    const populatedClient = await Client.findById(client._id)
      .populate('userId', 'firstName lastName email roles')
      .populate('coachId');

    res.status(201).json(populatedClient);
  } catch (error) {
    console.error('Error in addClient:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      errors: error.errors,
      stack: error.stack
    });
    
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : [],
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  getCoaches,
  addCoach,
  addClient,
}; 