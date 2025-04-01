import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};

// Team services
export const teamService = {
  getCoaches: () => api.get('/api/coaches'),
  addCoach: (coachData) => api.post('/api/coaches', coachData),
  addClient: (coachId, clientData) => api.post(`/api/coaches/${coachId}/clients`, clientData),
  getClientByEmail: (email) => api.get(`/api/clients/email/${email}`),
  getClientWorkouts: (clientId) => api.get(`/api/clients/${clientId}/workouts`),
};

// Workout services
export const workoutService = {
  getClientWorkouts: (clientId) => api.get(`/api/workouts/client/${clientId}`),
  getWorkoutById: (workoutId) => api.get(`/api/workouts/${workoutId}`),
  createWorkout: (workoutData) => api.post('/api/workouts', workoutData),
  updateWorkout: (workoutId, workoutData) => api.put(`/api/workouts/${workoutId}`, workoutData),
  deleteWorkout: (workoutId) => api.delete(`/api/workouts/${workoutId}`),
};

// Calendar services
export const calendarService = {
  getEvents: (startDate, endDate) => api.get('/calendar/events', { params: { startDate, endDate } }),
  createEvent: (eventData) => api.post('/calendar/events', eventData),
};

export default api; 