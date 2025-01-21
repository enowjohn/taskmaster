import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = 'https://taskmaster-api-39px.onrender.com';

// Create axios instance with default config
const instance = axios.create({
  baseURL: API_URL,
  withCredentials: false, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      toast.error(message);
    } else if (error.request) {
      // Request was made but no response
      toast.error('Unable to connect to the server');
    } else {
      // Something else happened
      toast.error('An error occurred');
    }
    
    return Promise.reject(error);
  }
);

export default instance;
