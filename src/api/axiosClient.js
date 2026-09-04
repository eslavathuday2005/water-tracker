import axios from 'axios';

// API base URL configured via environment variable (VITE_API_URL) with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach JWT access token if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hydrotrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract error message & handle 401
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If token expired or unauthorized
    if (error.response && error.response.status === 401) {
      // Clear token only if on private route
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('hydrotrack_token');
        localStorage.removeItem('hydrotrack_user');
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
