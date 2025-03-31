const Client = require('../models/clientModel');
const Workout = require('../models/workoutModel');

// @desc    Get client's workouts
// @route   GET /api/clients/:id/workouts
// @access  Private
const getClientWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ 
      clientId: req.params.id 
    }).sort({ date: 1 });
    
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get client by ID
// @route   GET /api/clients/:id
// @access  Private
const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('coachId');
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get client by email
// @route   GET /api/clients/email/:email
// @access  Private
const getClientByEmail = async (req, res) => {
  try {
    const client = await Client.findOne({ 'email': req.params.email })
      .populate('userId', 'firstName lastName email')
      .populate('coachId', 'userId');
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('userId', 'firstName lastName email')
     .populate('coachId');

    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add progress entry
// @route   POST /api/clients/:id/progress
// @access  Private
const addProgress = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.progressHistory.push({
      date: new Date(),
      ...req.body
    });

    await client.save();
    res.json(client.progressHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get client's progress history
// @route   GET /api/clients/progress
// @access  Private
const getClientProgress = async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user._id });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client.progressHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get client's dashboard data
// @route   GET /api/clients/dashboard
// @access  Private
const getClientDashboard = async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user._id });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Get recent workouts
    const recentWorkouts = await Workout.find({ clientId: client._id })
      .sort({ date: -1 })
      .limit(5);

    // Get latest progress entry
    const latestProgress = client.progressHistory.length > 0 
      ? client.progressHistory[client.progressHistory.length - 1] 
      : null;

    // Get upcoming workouts
    const upcomingWorkouts = await Workout.find({
      clientId: client._id,
      date: { $gte: new Date() }
    })
    .sort({ date: 1 })
    .limit(5);

    // Compile dashboard data
    const dashboardData = {
      clientInfo: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        profile: client.profile
      },
      stats: {
        totalWorkouts: await Workout.countDocuments({ clientId: client._id }),
        completedWorkouts: await Workout.countDocuments({ 
          clientId: client._id,
          completed: true 
        }),
        latestProgress
      },
      recentWorkouts,
      upcomingWorkouts
    };
    
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getClientWorkouts,
  getClientById,
  getClientByEmail,
  updateClient,
  addProgress,
  getClientProgress,
  getClientDashboard
}; 