import API from './api';

export const getWishlist = async (email) => {
  try {
    const response = await API.get(`/wishlist/${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
};

export const addToWishlist = async (email, productId) => {
  try {
    const response = await API.post('/wishlist', { email, productId });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (email, productId) => {
  try {
    const response = await API.delete(`/wishlist/${encodeURIComponent(email)}/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

// ADD THIS FUNCTION
export const checkInWishlist = async (email, productId) => {
  try {
    const wishlist = await getWishlist(email);
    return wishlist.some(item => item.wishlist_ProductId === productId);
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};