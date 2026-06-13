import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API, { getStoreSettings } from '../services/api';
import ProductCard from '../components/ProductCard';
import PageMeta from '../components/PageMeta';


function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('MyStore');

  useEffect(() => {
    fetchFeaturedProducts();
    fetchStoreName();
  }, []);

  const fetchStoreName = async () => {
    const settings = await getStoreSettings();
    if (settings?.storeName) {
      setStoreName(settings.storeName);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await API.get('/products');
      const featured = response.data.filter(p => p.product_IsFeatured === true && p.product_IsActive === true);
      setFeaturedProducts(featured.slice(0, 4));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Home"
        description={`Shop curated products at ${storeName}. Quality items delivered to your door.`}
        path="/"
      />
      {/* Hero Section */}
      <div className="hero">
        <div className="container">
          <h1>Welcome to <span>{storeName}</span></h1>
          <p>Curated quality · Trusted service · Delivered to your door</p>
          <Link to="/products" className="shop-now-btn">Shop Now</Link>
        </div>
      </div>

      {/* Featured Products */}
      <div className="container">
        <h2 className="section-title">Featured Products</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.product_Id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;