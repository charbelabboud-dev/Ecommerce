import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5147';

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request automatically
API.interceptors.request.use(
  (config) => {
    // Check for customer token OR admin token
    const token = localStorage.getItem('customerToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = localStorage.getItem('customerToken');
      if (hadToken) {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customer');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const getStoreSettings = async () => {
  try {
    const response = await API.get('/store/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return null;
  }
};

export default API;