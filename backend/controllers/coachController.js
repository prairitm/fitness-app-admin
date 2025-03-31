const Coach = require('../models/coachModel');
const User = require('../models/userModel');
const Client = require('../models/clientModel');

// @desc    Get all coaches
// @route   GET /api/coaches
// @access  Private
const getAllCoaches = async (req, res) => {
  try {
    const coaches = await Coach.find()
      .populate('userId', 'firstName lastName email')
      .populate('clients');
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new coach
// @route   POST /api/coaches
// @access  Private (Admin)
const addCoach = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Split name into firstName and lastName
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Create user first
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: Math.random().toString(36).slice(-8), // Generate random password
      role: 'coach'
    });

    // Create coach profile
    const coach = await Coach.create({
      userId: user._id,
      adminId: req.user._id,
      profile: {
        specialization: '',
        bio: '',
        yearsExperience: 0
      }
    });

    // Return combined data
    res.status(201).json({
      name,
      email,
      clients: [],
      id: coach._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get coach by ID
// @route   GET /api/coaches/:id
// @access  Private
const getCoachById = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('clients');
    
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    
    res.json(coach);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update coach
// @route   PUT /api/coaches/:id
// @access  Private
const updateCoach = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    const updatedCoach = await Coach.findByIdAndUpdate(
      req.params.id,
      { 
        profile: req.body.profile 
      },
      { new: true }
    ).populate('userId', 'firstName lastName email')
     .populate('clients');

    res.json(updatedCoach);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get coach's clients
// @route   GET /api/coaches/:id/clients
// @access  Private
const getCoachClients = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id)
      .populate({
        path: 'clients',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      });
    
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    
    res.json(coach.clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add client to coach
// @route   POST /api/coaches/:id/clients
// @access  Private
const addClient = async (req, res) => {
  try {
    const { name, email } = req.body;
    const coach = await Coach.findById(req.params.id);

    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    // Split name into firstName and lastName
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Create user first
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: Math.random().toString(36).slice(-8), // Generate random password
      role: 'client'
    });

    // Create client profile
    const client = await Client.create({
      userId: user._id,
      coachId: coach._id,
      name: `${firstName} ${lastName}`,
      email: email
    });

    // Add client to coach's clients array
    coach.clients.push(client._id);
    await coach.save();

    // Return combined data
    res.status(201).json({
      name: `${firstName} ${lastName}`,
      email,
      id: client._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCoaches,
  addCoach,
  getCoachById,
  updateCoach,
  getCoachClients,
  addClient
}; 