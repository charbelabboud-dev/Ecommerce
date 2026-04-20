import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5147/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getStoreSettings = async () => {
  try {
    const response = await API.get('/adminusers/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return null;
  }
};

export default API;