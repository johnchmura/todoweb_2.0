import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/enter';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  checkUsername: (data) => api.post('/auth/check-username', data),
};

// Tasks API
export const tasksAPI = {
  getTasks: () => api.get('/tasks'),
  createTask: (taskData) => api.post('/tasks', taskData),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  completeTask: (taskId) => api.patch(`/tasks/${taskId}/complete`),
};

// User API
export const userAPI = {
  getUser: (userId) => api.get(`/users/${userId}`),
  updateExperience: (points) => api.patch('/users/experience', { points }),
};

// Calendar API
export const calendarAPI = {
  getNotes: () => api.get('/calendar-notes'),
  createNote: (noteData) => api.post('/calendar-notes', noteData),
  getNote: (date) => api.get(`/calendar-notes/${date}`),
};

export default api;
