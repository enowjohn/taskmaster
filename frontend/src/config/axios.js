import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance
const instance = axios.create({
  baseURL: 'http://localhost:9000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Request interceptor
instance.interceptors.request.use(
  config => {
    // Ensure credentials and headers are set
    config.withCredentials = true;
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      toast.error(error.response.data?.message || 'An error occurred');
    } else if (error.request) {
      toast.error('Network error. Please check your connection');
    } else {
      toast.error('An error occurred');
    }
    return Promise.reject(error);
  }
);

export default instance;
