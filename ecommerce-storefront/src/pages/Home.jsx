    import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ProductCard from '../components/ProductCard';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

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
      {/* Hero Section */}
      <div className="hero">
        <div className="container">
          <h1>Welcome to MyStore</h1>
          <p>Discover amazing products at great prices</p>
          <a href="/products" className="shop-now-btn">Shop Now</a>
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