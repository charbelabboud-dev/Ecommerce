import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getWishlist, removeFromWishlist } from '../services/wishlistApi';
import { addToCart } from '../services/api';
import './Wishlist.css';

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerEmail, setCustomerEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(true);
  const { addToCart: addToCartContext } = useCart();

  useEffect(() => {
    const savedEmail = localStorage.getItem('customerEmail');
    if (savedEmail) {
      setCustomerEmail(savedEmail);
      fetchWishlist(savedEmail);
      setShowEmailInput(false);
    }
  }, []);

  const fetchWishlist = async (email) => {
    setLoading(true);
    const items = await getWishlist(email);
    setWishlistItems(items);
    setLoading(false);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (customerEmail.trim()) {
      localStorage.setItem('customerEmail', customerEmail);
      fetchWishlist(customerEmail);
      setShowEmailInput(false);
    }
  };

  const handleRemove = async (productId) => {
    await removeFromWishlist(customerEmail, productId);
    fetchWishlist(customerEmail);
  };

  const handleAddToCart = async (product) => {
    addToCartContext(product, 1);
    // Optionally remove from wishlist after adding to cart
    // await handleRemove(product.product_Id);
  };

  const getPrice = (product) => {
    if (product.product_PriceUSD) {
      return `$${product.product_PriceUSD.toFixed(2)}`;
    }
    if (product.product_PriceLBP) {
      return `${product.product_PriceLBP.toFixed(2)} LBP`;
    }
    return 'N/A';
  };

  const getImageUrl = (product) => {
    if (product.productImages && product.productImages.length > 0) {
      return `http://localhost:5147${product.productImages[0].productImage_ImageUrl}`;
    }
    return null;
  };

  if (showEmailInput) {
    return (
      <div className="container">
        <div className="wishlist-email-container">
          <h2>My Wishlist</h2>
          <p>Enter your email to view your saved items</p>
          <form onSubmit={handleEmailSubmit} className="wishlist-email-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
            <button type="submit">View Wishlist</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="container loading">Loading your wishlist...</div>;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-wishlist">
          <h2>Your Wishlist is Empty</h2>
          <p>Save your favorite items here!</p>
          <Link to="/products" className="continue-shopping-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <button 
          className="change-email-btn"
          onClick={() => {
            localStorage.removeItem('customerEmail');
            setShowEmailInput(true);
            setCustomerEmail('');
          }}
        >
          Change Email
        </button>
      </div>

      <div className="wishlist-grid">
        {wishlistItems.map((item) => (
          <div key={item.wishlist_Id} className="wishlist-card">
            <Link to={`/product/${item.product.product_Id}`} className="wishlist-image-link">
              {getImageUrl(item.product) ? (
                <img 
                  src={getImageUrl(item.product)} 
                  alt={item.product.product_Name}
                  className="wishlist-image"
                />
              ) : (
                <div className="wishlist-image-placeholder">No Image</div>
              )}
            </Link>
            <div className="wishlist-info">
              <h3 className="wishlist-title">
                <Link to={`/product/${item.product.product_Id}`}>
                  {item.product.product_Name}
                </Link>
              </h3>
              <p className="wishlist-price">{getPrice(item.product)}</p>
              <div className="wishlist-actions">
                <button 
                  className="add-to-cart-wishlist"
                  onClick={() => handleAddToCart(item.product)}
                >
                  Add to Cart
                </button>
                <button 
                  className="remove-from-wishlist"
                  onClick={() => handleRemove(item.product.product_Id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;