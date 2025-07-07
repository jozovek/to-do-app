import axios from 'axios';

// Environment-aware API URL
const API_URL = import.meta.env.VITE_API_URL || '/api'  // Production: use environment variable or fallback to relative path

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const authService = {
  async login(email) {
    const response = await api.post('/auth/login', { email });
    return response.data;
  },
  
  async verifyToken(token) {
    const response = await api.get(`/auth/verify?token=${token}`);
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userEmail', response.data.email);
    return response.data;
  },
  
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
};

// Todo service
export const todoService = {
  async getAllTodos() {
    const response = await api.get('/todos');
    return response.data;
  },
  
  async createTodo(todo) {
    const response = await api.post('/todos', todo);
    return response.data;
  },
  
  async updateTodo(id, updates) {
    const response = await api.put(`/todos/${id}`, updates);
    return response.data;
  },
  
  async deleteTodo(id) {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  }
};
