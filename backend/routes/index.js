const express = require('express');
const router = express.Router();
const { protect, admin, coach } = require('../middleware/authMiddleware');
const clientRoutes = require('./clientRoutes');

// Auth routes
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);

// Team routes
router.get('/teams/coaches', protect, admin, getCoaches);
router.post('/teams/coaches', protect, admin, addCoach);
router.post('/teams/coaches/:coachId/clients', protect, addClient);

// Client routes
router.use('/clients', protect, clientRoutes);

// Workout routes
router.get('/workouts/client/:clientId', protect, getClientWorkouts);
router.post('/workouts', protect, coach, createWorkout);
router.put('/workouts/:id', protect, coach, updateWorkout);
router.delete('/workouts/:id', protect, coach, deleteWorkout);

// Calendar routes
router.get('/calendar/events', protect, getEvents);
router.post('/calendar/events', protect, createEvent);

module.exports = router; 