import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ProductCard from '../components/ProductCard';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await API.get('/products');
      const activeProducts = response.data.filter(p => p.product_IsActive === true);
      setProducts(activeProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = product.product_Name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || product.product_CategoryId === parseInt(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const getProductCount = (categoryId) => {
    if (categoryId === 'all') return products.length;
    return products.filter(p => p.product_CategoryId === parseInt(categoryId)).length;
  };

  return (
    <div className="container">
      <div className="products-page">
        {/* Filter Toggle Button (Mobile) */}
        <button 
          className="filter-toggle-btn"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          {isFilterOpen ? '✕ Close Filters' : '☰ Filters'}
        </button>

        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className={`filters-sidebar ${isFilterOpen ? 'open' : ''}`}>
            <div className="filter-section">
              <h3>Categories</h3>
              <div className="category-list">
                <button
                  className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory('all');
                    setIsFilterOpen(false);
                  }}
                >
                  <span>All Products</span>
                  <span className="count">{getProductCount('all')}</span>
                </button>
                {categories.map(category => (
                  <button
                    key={category.category_Id}
                    className={`category-item ${selectedCategory === category.category_Id.toString() ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category.category_Id.toString());
                      setIsFilterOpen(false);
                    }}
                  >
                    <span>{category.category_Name}</span>
                    <span className="count">{getProductCount(category.category_Id.toString())}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="products-main">
            <div className="products-header">
              <h1>
                {selectedCategory === 'all' 
                  ? 'All Products' 
                  : categories.find(c => c.category_Id === parseInt(selectedCategory))?.category_Name || 'Products'}
              </h1>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="🔍 Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="results-count">
              Found {filteredProducts.length} product(s)
            </div>

            {loading ? (
              <div className="loading">Loading products...</div>
            ) : (
              <>
                <div className="products-grid">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.product_Id} product={product} />
                  ))}
                </div>
                {filteredProducts.length === 0 && (
                  <div className="no-results">No products found matching your criteria.</div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Products;