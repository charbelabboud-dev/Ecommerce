import API from './api';

export const getStoreSettings = async () => {
  try {
    const response = await API.get('/adminusers/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return null;
  }
};