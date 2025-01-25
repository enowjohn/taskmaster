import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const instance = axios.create({
  baseURL: API_URL,
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  transformRequest: [(data) => {
    return JSON.stringify(data);
  }],
  withCredentials: true
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
    return Promise.reject(error);
  }
);

// Add response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Show error toast
    // toast.error(message);
    
    return Promise.reject(error);
  }
);

export default instance;
