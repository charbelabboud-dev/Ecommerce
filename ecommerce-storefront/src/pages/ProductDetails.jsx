import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import ProductImageGallery from '../components/ProductImageGallery';
import { getProductReviews, getProductRating, submitReview } from '../services/reviewApi';
import { addToWishlist, removeFromWishlist, checkInWishlist } from '../services/wishlistApi';
import { useToast } from '../contexts/ToastContext';
import {
  getEffectiveDiscountPercent,
  hasDiscount,
  formatProductPrice,
  formatOriginalProductPrice
} from '../utils/pricing';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState({ averageRating: 0, reviewCount: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  const [reviewForm, setReviewForm] = useState({
    review_CustomerName: '',
    review_CustomerEmail: '',
    review_Rating: 5,
    review_Comment: '',
    review_ProductId: parseInt(id)
  });

  // Reset state when product ID changes
  useEffect(() => {
    setProduct(null);
    setLoading(true);
    setActiveTab('description');
    setQuantity(1);
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
      fetchReviews();
      fetchRating();
      checkWishlistStatus();
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const response = await API.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await API.get('/products');
      const sameCategoryProducts = response.data.filter(p => 
        p.product_CategoryId === product.product_CategoryId && 
        p.product_Id !== product.product_Id &&
        p.product_IsActive === true
      );
      setRelatedProducts(sameCategoryProducts.slice(0, 4));
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const fetchReviews = async () => {
    const productReviews = await getProductReviews(parseInt(id));
    setReviews(productReviews);
  };

  const fetchRating = async () => {
    const productRating = await getProductRating(parseInt(id));
    setRating(productRating);
  };

  const checkWishlistStatus = async () => {
    const token = localStorage.getItem('customerToken');
    if (token && product) {
      const inWishlist = await checkInWishlist(product.product_Id);
      setIsInWishlist(inWishlist);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await submitReview(reviewForm);
      addToast('Review submitted! Awaiting admin approval.', 'success');
      setShowReviewForm(false);
      setReviewForm({
        ...reviewForm,
        review_CustomerName: '',
        review_CustomerEmail: '',
        review_Rating: 5,
        review_Comment: ''
      });
      fetchReviews();
      fetchRating();
    } catch (error) {
      addToast('Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      addToast('Please login to add items to wishlist', 'error');
      navigate('/login');
      return;
    }

    if (isInWishlist) {
      await removeFromWishlist(product.product_Id);
      setIsInWishlist(false);
      addToast('Removed from wishlist', 'info');
    } else {
      await addToWishlist(product.product_Id);
      setIsInWishlist(true);
      addToast('Added to wishlist!', 'success');
    }
  };


  const handleAddToCart = () => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      addToast('Please login to add items to cart', 'error');
      navigate('/login');
      return;
    }
    addToCart(product, quantity);
    addToast(`${product.product_Name} added to cart!`, 'success');
  };

  const handleQuantityChange = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = 1;
    if (val < 1) val = 1;
    if (product?.product_Stock && val > product.product_Stock) val = product.product_Stock;
    setQuantity(val);
  };

  const isLowStock = product?.product_Stock <= 5 && product?.product_Stock > 0;
  const isOutOfStock = product?.product_Stock === 0;
  const discount = product ? Math.round(getEffectiveDiscountPercent(product) || 0) : 0;
  const onSale = product ? hasDiscount(product) : false;

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="not-found">
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn-primary">Back to Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span className="current">{product.product_Name}</span>
        </div>

        <div className="product-detail-grid">
          {/* Image Gallery */}
          <ProductImageGallery
            images={product.productImages || []}
            productName={product.product_Name}
            discount={discount}
          />

          {/* Product Info */}
          <div className="product-info-section">
            {product.category && (
              <Link to={`/products?category=${product.category.category_Id}`} className="product-category">
                {product.category.category_Name}
              </Link>
            )}
            <h1 className="product-title">{product.product_Name}</h1>
            
            <div className="product-rating">
              <div className="stars">
                {'★'.repeat(Math.round(rating.averageRating))}
                {'☆'.repeat(5 - Math.round(rating.averageRating))}
              </div>
              <span className="rating-text">({rating.reviewCount} reviews)</span>
            </div>

            {onSale && (
              <div className="product-discount-pill">Discount {discount}%</div>
            )}

            <div className="product-pricing">
              <div className="current-price">{formatProductPrice(product)}</div>
              {onSale && (
                <div className="original-price">{formatOriginalProductPrice(product)}</div>
              )}
            </div>

            {isLowStock && (
              <div className="stock-alert low-stock">
                ⚠️ Only {product.product_Stock} items left in stock! Order soon.
              </div>
            )}
            {isOutOfStock && (
              <div className="stock-alert out-of-stock">
                ❌ Out of Stock
              </div>
            )}

            <div className="product-short-description">
              {product.product_ShortDescription || product.product_Description?.substring(0, 150)}
            </div>

            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">SKU:</span>
                <span className="meta-value">{product.product_SKU || 'N/A'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-value">{product.category?.category_Name || 'Uncategorized'}</span>
              </div>
            </div>
            <div className="meta-item">
    <span className="meta-label">Shipping Fee:</span>
    <span className="meta-value">
      {product.product_ShippingFee > 0 
        ? `$${product.product_ShippingFee.toFixed(2)}` 
        : 'Free'}
    </span>
  </div>

            <div className="product-detail-actions">
              <div className="quantity-section">
                <div className="quantity-selector">
                  <button 
                    className="qty-btn"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={product.product_Stock || 999}
                  />
                  <button 
                    className="qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isOutOfStock || (product.product_Stock && quantity >= product.product_Stock)}
                  >
                    +
                  </button>
                </div>
              </div>
              <button 
                className="add-to-cart-main"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button 
                className="wishlist-detail-btn"
                onClick={handleWishlistToggle}
              >
                {isInWishlist ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
              </button>
            </div>

            <div className="shipping-info">
              <div className="info-item">
                <span className="info-icon">🚚</span>
                <span>Free delivery on orders over $50</span>
              </div>
              <div className="info-item">
                <span className="info-icon">💰</span>
                <span>Cash on delivery available</span>
              </div>
              <div className="info-item">
                <span className="info-icon">↩️</span>
                <span>14-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="product-tabs">
          <div className="tab-headers">
            <button 
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button 
              className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping & Returns
            </button>
          </div>
          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="tab-pane">
                <p>{product.product_Description || 'No description available for this product.'}</p>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="tab-pane">
                <table className="specs-table">
                  <tbody>
                    <tr>
                      <td>Product Name</td>
                      <td>{product.product_Name}</td>
                    </tr>
                    <tr>
                      <td>SKU</td>
                      <td>{product.product_SKU || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Category</td>
                      <td>{product.category?.category_Name || 'Uncategorized'}</td>
                    </tr>
                    <tr>
                      <td>Stock Status</td>
                      <td>{isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${product.product_Stock} left` : 'In Stock'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="tab-pane">
                <h4>Delivery Information</h4>
                <p>We offer cash on delivery for all orders within Lebanon. Delivery typically takes 2-4 business days.</p>
                <h4>Returns Policy</h4>
                <p>You can return any item within 14 days of delivery for a full refund. Items must be unused and in original packaging.</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <div>
              <h3>Customer Reviews</h3>
              <div className="rating-summary">
                <span className="average-rating">{rating.averageRating.toFixed(1)}</span>
                <div className="stars-display">
                  {'★'.repeat(Math.round(rating.averageRating))}
                  {'☆'.repeat(5 - Math.round(rating.averageRating))}
                </div>
                <span className="review-count">({rating.reviewCount} reviews)</span>
              </div>
            </div>
            <button 
              className="write-review-btn"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>

          {showReviewForm && (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <h4>Write Your Review</h4>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={reviewForm.review_CustomerName}
                  onChange={(e) => setReviewForm({...reviewForm, review_CustomerName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={reviewForm.review_CustomerEmail}
                  onChange={(e) => setReviewForm({...reviewForm, review_CustomerEmail: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rating *</label>
                <select
                  value={reviewForm.review_Rating}
                  onChange={(e) => setReviewForm({...reviewForm, review_Rating: parseInt(e.target.value)})}
                >
                  <option value="5">★★★★★ (5/5) - Excellent</option>
                  <option value="4">★★★★☆ (4/5) - Very Good</option>
                  <option value="3">★★★☆☆ (3/5) - Good</option>
                  <option value="2">★★☆☆☆ (2/5) - Fair</option>
                  <option value="1">★☆☆☆☆ (1/5) - Poor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Your Review *</label>
                <textarea
                  rows="4"
                  value={reviewForm.review_Comment}
                  onChange={(e) => setReviewForm({...reviewForm, review_Comment: e.target.value})}
                  required
                />
              </div>
              <button type="submit" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map(review => (
                <div key={review.review_Id} className="review-card">
                  <div className="review-header">
                    <strong>{review.review_CustomerName}</strong>
                    <div className="review-stars">
                      {'★'.repeat(review.review_Rating)}
                      {'☆'.repeat(5 - review.review_Rating)}
                    </div>
                    <span className="review-date">
                      {new Date(review.review_CreatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="review-comment">{review.review_Comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="related-products">
          <h3>You Might Also Like</h3>
          <div className="related-grid">
            {relatedProducts.length === 0 ? (
              <p className="coming-soon">More products coming soon...</p>
            ) : (
              <div className="products-grid">
                {relatedProducts.map(relatedProduct => (
                  <ProductCard key={relatedProduct.product_Id} product={relatedProduct} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;