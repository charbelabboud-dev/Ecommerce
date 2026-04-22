import API from './api';

export const getCustomerOrders = async () => {
  try {
    const response = await API.get('/orders/customer');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};