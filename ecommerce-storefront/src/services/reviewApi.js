import API from './api';

export const getProductReviews = async (productId) => {
  try {
    const response = await API.get(`/reviews/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const getProductRating = async (productId) => {
  try {
    const response = await API.get(`/reviews/product/${productId}/rating`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rating:', error);
    return { averageRating: 0, reviewCount: 0 };
  }
};

export const submitReview = async (reviewData) => {
  try {
    const response = await API.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};