import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with default config
const instance = axios.create({
  baseURL: 'http://localhost:9000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 10000 // 10 second timeout
});

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error);
    
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection and try again.');
      return Promise.reject(new Error('Network error'));
    }

    // Handle specific status codes
    switch (error.response.status) {
      case 400:
        toast.error(error.response.data.message || 'Invalid request');
        break;
      case 401:
        toast.error('Please login to continue');
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        toast.error('Access denied');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 500:
        toast.error(error.response.data.message || 'Server error. Please try again later.');
        break;
      default:
        toast.error('Something went wrong. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default instance;
