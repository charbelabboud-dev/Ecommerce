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
  timeout: 30000,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  if (!error.response) return true;
  const status = error.response.status;
  return status === 502 || status === 503 || status === 504;
};

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
  async (error) => {
    const config = error.config;
    if (config && isRetryableError(error)) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      if (config.__retryCount <= 2) {
        await sleep(4000 * config.__retryCount);
        return API(config);
      }
    }

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