import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../contexts/ToastContexts';
import { useConfirm } from '../contexts/ConfirmContext';
import './AdminReviews.css';

function AdminReviews() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        API.get('/reviews/pending'),
        API.get('/reviews/approved'),
      ]);
      setPendingReviews(pendingRes.data);
      setApprovedReviews(approvedRes.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      addToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      await API.put(`/reviews/${reviewId}/approve`);
      addToast('Review approved successfully!', 'success');
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      addToast('Failed to approve review', 'error');
    }
  };

  const handleDelete = async (reviewId) => {
    const userConfirmed = await confirm('Are you sure you want to delete this review?');
    if (!userConfirmed) return;

    try {
      await API.delete(`/reviews/${reviewId}`);
      addToast('Review deleted successfully', 'success');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      addToast('Failed to delete review', 'error');
    }
  };

  const goBack = () => {
    navigate('/');
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const renderReviewCard = (review, showApprove = false) => (
    <div key={review.review_Id} className="review-card">
      <div className="review-header">
        <div className="review-product">
          <strong>Product:</strong> {review.product?.product_Name || 'N/A'}
        </div>
        <div className="review-customer">
          <strong>Customer:</strong> {review.review_CustomerName}
        </div>
        <div className="review-email">
          <strong>Email:</strong> {review.review_CustomerEmail}
        </div>
        <div className="review-rating">
          <strong>Rating:</strong>
          <span className="stars">{renderStars(review.review_Rating)}</span>
        </div>
        <div className="review-date">
          <strong>Date:</strong> {new Date(review.review_CreatedAt).toLocaleDateString()}
        </div>
      </div>
      <div className="review-comment">
        <strong>Comment:</strong>
        <p>{review.review_Comment}</p>
      </div>
      <div className="review-actions">
        {showApprove && (
          <button className="approve-btn" onClick={() => handleApprove(review.review_Id)}>
            ✓ Approve
          </button>
        )}
        <button className="delete-btn" onClick={() => handleDelete(review.review_Id)}>
          ✗ Delete
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Loading reviews...</div>;
  }

  return (
    <div className="admin-reviews-container">
      <div className="admin-reviews-header">
        <div className="header-left">
          <button className="back-button" onClick={goBack}>
            ← Back
          </button>
          <h1>Manage Reviews</h1>
        </div>
      </div>

      <div className="reviews-tabs">
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingReviews.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved ({approvedReviews.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="reviews-list">
          {pendingReviews.length === 0 ? (
            <div className="no-reviews">No pending reviews</div>
          ) : (
            pendingReviews.map((review) => renderReviewCard(review, true))
          )}
        </div>
      )}

      {activeTab === 'approved' && (
        <div className="reviews-list">
          {approvedReviews.length === 0 ? (
            <div className="no-reviews">No approved reviews yet</div>
          ) : (
            approvedReviews.map((review) => renderReviewCard(review, false))
          )}
        </div>
      )}
    </div>
  );
}

export default AdminReviews;
