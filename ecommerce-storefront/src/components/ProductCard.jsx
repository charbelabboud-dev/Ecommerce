import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { addToWishlist, removeFromWishlist, checkInWishlist } from '../services/wishlistApi';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('customerEmail');
    if (savedEmail) {
      setCustomerEmail(savedEmail);
      checkWishlistStatus(savedEmail);
    }
  }, [product.product_Id]);

  const checkWishlistStatus = async (email) => {
    const inWishlist = await checkInWishlist(email, product.product_Id);
    setIsInWishlist(inWishlist);
  };

  const handleWishlistToggle = async () => {
    const email = localStorage.getItem('customerEmail');
    if (!email) {
      const userEmail = prompt('Enter your email to save items to wishlist:');
      if (userEmail) {
        localStorage.setItem('customerEmail', userEmail);
        setCustomerEmail(userEmail);
        await addToWishlist(userEmail, product.product_Id);
        setIsInWishlist(true);
      }
    } else {
      if (isInWishlist) {
        await removeFromWishlist(email, product.product_Id);
        setIsInWishlist(false);
      } else {
        await addToWishlist(email, product.product_Id);
        setIsInWishlist(true);
      }
    }
  };

  const getPrice = () => {
    if (product.product_PriceUSD) {
      return `$${product.product_PriceUSD.toFixed(2)}`;
    }
    if (product.product_PriceLBP) {
      return `${product.product_PriceLBP.toFixed(2)} LBP`;
    }
    return 'N/A';
  };

  const getImageUrl = () => {
    if (product.productImages && product.productImages.length > 0) {
      return `http://localhost:5147${product.productImages[0].productImage_ImageUrl}`;
    }
    return null;
  };

  const isLowStock = product.product_Stock <= 5 && product.product_Stock > 0;
  const isOutOfStock = product.product_Stock === 0;

  return (
    <div className="product-card">
      <div className="wishlist-icon" onClick={handleWishlistToggle}>
        {isInWishlist ? '❤️' : '🤍'}
      </div>
      <Link to={`/product/${product.product_Id}`} className="product-image-link">
        {getImageUrl() ? (
          <img src={getImageUrl()} alt={product.product_Name} className="product-image" />
        ) : (
          <div className="product-image-placeholder">No Image</div>
        )}
      </Link>
      <div className="product-info">
        <h3 className="product-title">
          <Link to={`/product/${product.product_Id}`}>{product.product_Name}</Link>
        </h3>
        
        {isLowStock && (
          <span className="low-stock-badge">⚠️ Only {product.product_Stock} left!</span>
        )}
        {isOutOfStock && (
          <span className="out-of-stock-badge">Out of Stock</span>
        )}
        
        {product.category && (
          <span className="product-category-badge">{product.category.category_Name}</span>
        )}
        <p className="product-description">{product.product_ShortDescription}</p>
        <div className="product-footer">
          <div>
    <span className="product-price">{getPrice()}</span>
    {product.product_ShippingFee > 0 && (
      <span className="product-shipping">
        + ${product.product_ShippingFee.toFixed(2)} shipping
      </span>
    )}
  </div>  
          <button 
            className="add-to-cart-btn" 
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;