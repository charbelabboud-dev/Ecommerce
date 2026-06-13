import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { addToWishlist, removeFromWishlist, checkInWishlist } from '../services/wishlistApi';
import { useToast } from '../contexts/ToastContext';
import { getImageUrl } from '../services/api';
import { HeartIcon } from './Icons';
import {
  getEffectiveDiscountPercent,
  hasDiscount,
  formatProductPrice,
  formatOriginalProductPrice
} from '../utils/pricing';
import './ProductCard.css';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    if (token) {
      checkWishlistStatus();
    }
  }, [product.product_Id]);

  const checkWishlistStatus = async () => {
    const inWishlist = await checkInWishlist(product.product_Id);
    setIsInWishlist(inWishlist);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem('customerToken');
    if (!token) {
      addToast('Please login to add items to cart', 'error');
      navigate('/login');
      return;
    }
    addToCart(product, 1);
    addToast(`${product.product_Name} added to cart!`, 'success');
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  const discountPercent = getEffectiveDiscountPercent(product);
  const onSale = hasDiscount(product);

  const images = product.productImages || [];
  const mainImage = images.find(img => img.productImage_IsMain) || images[0];
  const imageUrl = mainImage ? getImageUrl(mainImage.productImage_ImageUrl) : null;
  const imageCount = images.length;

  const isLowStock = product.product_Stock <= 5 && product.product_Stock > 0;
  const isOutOfStock = product.product_Stock === 0;
  const categoryName = product.category?.category_Name;

  return (
    <article className="product-card">
      {onSale && (
        <div className="product-discount-banner">
          Discount {Math.round(discountPercent)}%
        </div>
      )}
      <div className="product-card-media">
        <button
          type="button"
          className={`product-card-wishlist ${isInWishlist ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <HeartIcon filled={isInWishlist} />
        </button>

        {categoryName && (
          <span className="product-card-category">{categoryName}</span>
        )}

        <Link to={`/product/${product.product_Id}`} className="product-image-link">
          {imageUrl ? (
            <img src={imageUrl} alt={product.product_Name} className="product-image" loading="lazy" />
          ) : (
            <div className="product-image-placeholder">No image</div>
          )}
        </Link>

        {imageCount > 1 && (
          <span className="photo-count-badge">{imageCount} photos</span>
        )}
      </div>

      <div className="product-card-body">
        <h3 className="product-title">
          <Link to={`/product/${product.product_Id}`}>{product.product_Name}</Link>
        </h3>

        {product.product_ShortDescription && (
          <p className="product-card-desc">{product.product_ShortDescription}</p>
        )}

        <div className="product-card-badges">
          {isLowStock && (
            <span className="low-stock-badge">Only {product.product_Stock} left</span>
          )}
          {isOutOfStock && (
            <span className="out-of-stock-badge">Out of stock</span>
          )}
        </div>

        <div className="product-card-pricing">
          <div className="product-card-price-row">
            {onSale ? (
              <>
                <span className="product-price product-price-sale">{formatProductPrice(product)}</span>
                <span className="product-price-original">{formatOriginalProductPrice(product)}</span>
              </>
            ) : (
              <span className="product-price">{formatProductPrice(product)}</span>
            )}
          </div>
          {product.product_ShippingFee > 0 && (
            <span className="product-shipping">
              + ${product.product_ShippingFee.toFixed(2)} shipping
            </span>
          )}
          <button
            type="button"
            className="product-card-cta"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
