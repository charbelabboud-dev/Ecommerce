import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Reset state when product ID changes
  useEffect(() => {
    setMainImage(null);
    setProduct(null);
    setLoading(true);
    setActiveTab('description');
    setQuantity(1);
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const response = await API.get(`/products/${id}`);
      setProduct(response.data);
      // Set main image from the new product's images
      if (response.data.productImages && response.data.productImages.length > 0) {
        setMainImage(response.data.productImages[0].productImage_ImageUrl);
      } else {
        setMainImage(null);
      }
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

  const getPrice = () => {
    if (product?.product_PriceUSD) {
      return `$${product.product_PriceUSD.toFixed(2)}`;
    }
    if (product?.product_PriceLBP) {
      return `${product.product_PriceLBP.toFixed(2)} LBP`;
    }
    return 'N/A';
  };

  const getOriginalPrice = () => {
    if (product?.product_CompareAtPriceUSD) {
      return `$${product.product_CompareAtPriceUSD.toFixed(2)}`;
    }
    if (product?.product_CompareAtPriceLBP) {
      return `${product.product_CompareAtPriceLBP.toFixed(2)} LBP`;
    }
    return null;
  };

  const getDiscount = () => {
    const original = getOriginalPrice();
    if (!original) return null;
    const current = parseFloat(getPrice().replace(/[^0-9.-]/g, ''));
    const originalVal = parseFloat(original.replace(/[^0-9.-]/g, ''));
    const discount = Math.round(((originalVal - current) / originalVal) * 100);
    return discount;
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
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
  const discount = getDiscount();

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
          <div className="product-gallery">
            <div className="main-image-container">
              {mainImage ? (
                <img 
                  src={`http://localhost:5147${mainImage}`} 
                  alt={product.product_Name}
                  className="main-product-image"
                />
              ) : (
                <div className="main-image-placeholder">No Image Available</div>
              )}
              {discount && (
                <div className="discount-badge">-{discount}%</div>
              )}
            </div>
            {product.productImages && product.productImages.length > 1 && (
              <div className="thumbnail-list">
                {product.productImages.map((img, index) => (
                  <div
                    key={img.productImage_Id}
                    className={`thumbnail-item ${mainImage === img.productImage_ImageUrl ? 'active' : ''}`}
                    onClick={() => setMainImage(img.productImage_ImageUrl)}
                  >
                    <img 
                      src={`http://localhost:5147${img.productImage_ImageUrl}`}
                      alt={`Thumbnail ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

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
                <span>★★★★★</span>
              </div>
              <span className="rating-text">No reviews yet</span>
            </div>

            <div className="product-pricing">
              <div className="current-price">{getPrice()}</div>
              {getOriginalPrice() && (
                <div className="original-price">{getOriginalPrice()}</div>
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
              <button 
                className="add-to-cart-main"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
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