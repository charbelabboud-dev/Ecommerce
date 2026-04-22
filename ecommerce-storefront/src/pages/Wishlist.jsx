import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getWishlist, removeFromWishlist } from '../services/wishlistApi';
import './Wishlist.css';

function Wishlist() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart: addToCartContext } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      alert('Please login to view your wishlist');
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [navigate]);

  const fetchWishlist = async () => {
    setLoading(true);
    const items = await getWishlist();
    setWishlistItems(items);
    setLoading(false);
  };

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
    fetchWishlist();
  };

  const handleAddToCart = async (product) => {
    if (product.product_Stock === 0) {
      alert('This product is out of stock and cannot be added to cart');
      return;
    }
    addToCartContext(product, 1);
    alert('Added to cart!');
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
              
              {/* Stock Status - Below Title */}
              <div className="wishlist-stock-status">
                {item.product.product_Stock === 0 ? (
                  <span className="out-of-stock">Out of Stock</span>
                ) : item.product.product_Stock <= 5 ? (
                  <span className="low-stock">⚠️ Only {item.product.product_Stock} left!</span>
                ) : (
                  <span className="in-stock">In Stock</span>
                )}
              </div>
              
              <p className="wishlist-price">{getPrice(item.product)}</p>
              
              <div className="wishlist-actions">
                <button 
                  className="add-to-cart-wishlist"
                  onClick={() => handleAddToCart(item.product)}
                  disabled={item.product.product_Stock === 0}
                  style={item.product.product_Stock === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {item.product.product_Stock === 0 ? 'Out of Stock' : 'Add to Cart'}
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