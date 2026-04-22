import API from './api';

export const getWishlist = async () => {
  try {
    const response = await API.get('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
};

export const addToWishlist = async (productId) => {
  try {
    const response = await API.post('/wishlist', { productId });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const response = await API.delete(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

export const checkInWishlist = async (productId) => {
  try {
    const wishlist = await getWishlist();
    return wishlist.some(item => item.wishlist_ProductId === productId);
  } catch (error) {
    return false;
  }
};