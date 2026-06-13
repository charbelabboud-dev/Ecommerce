import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import PageMeta from '../components/PageMeta';
import { SearchIcon, GridIcon } from '../components/Icons';
import './Products.css';

function ProductSkeleton() {
  return (
    <div className="product-skeleton">
      <div className="product-skeleton-image" />
      <div className="product-skeleton-body">
        <div className="product-skeleton-line medium" />
        <div className="product-skeleton-line short" />
        <div className="product-skeleton-line" />
      </div>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('catalog-filter-open', isFilterOpen);
    return () => document.body.classList.remove('catalog-filter-open');
  }, [isFilterOpen]);

  const closeFilters = () => setIsFilterOpen(false);

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

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesSearch = product.product_Name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.product_CategoryId === parseInt(selectedCategory);
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => (a.product_PriceUSD || a.product_PriceLBP || 0) - (b.product_PriceUSD || b.product_PriceLBP || 0));
        break;
      case 'price-high':
        result = [...result].sort((a, b) => (b.product_PriceUSD || b.product_PriceLBP || 0) - (a.product_PriceUSD || a.product_PriceLBP || 0));
        break;
      case 'name':
        result = [...result].sort((a, b) => a.product_Name.localeCompare(b.product_Name));
        break;
      default:
        result = [...result].sort((a, b) => new Date(b.product_CreatedAt) - new Date(a.product_CreatedAt));
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const getProductCount = (categoryId) => {
    if (categoryId === 'all') return products.length;
    return products.filter(p => p.product_CategoryId === parseInt(categoryId)).length;
  };

  const activeCategoryName = selectedCategory === 'all'
    ? 'All Products'
    : categories.find(c => c.category_Id === parseInt(selectedCategory))?.category_Name || 'Products';

  return (
    <div className="products-page-wrap">
      <PageMeta
        title="Products"
        description="Browse our full catalog of quality products."
        path="/products"
      />
      <div className="container products-page">
        <nav className="products-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{activeCategoryName}</span>
        </nav>

        <button
          type="button"
          className="catalog-filter-toggle"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <GridIcon size={16} />
          {isFilterOpen ? 'Close Filters' : 'Browse Categories'}
        </button>

        {isFilterOpen && (
          <button
            type="button"
            className="catalog-filter-backdrop"
            onClick={closeFilters}
            aria-label="Close categories"
          />
        )}

        <div className="catalog-layout">
          <aside className={`catalog-filters ${isFilterOpen ? 'open' : ''}`}>
            <div className="catalog-filter-section">
              <h3>Categories</h3>
              <div className="catalog-category-list">
                <button
                  type="button"
                  className={`catalog-category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory('all');
                    closeFilters();
                  }}
                >
                  <span>All Products</span>
                  <span className="count">{getProductCount('all')}</span>
                </button>
                {categories.map(category => (
                  <button
                    type="button"
                    key={category.category_Id}
                    className={`catalog-category-item ${selectedCategory === category.category_Id.toString() ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category.category_Id.toString());
                      closeFilters();
                    }}
                  >
                    <span>{category.category_Name}</span>
                    <span className="count">{getProductCount(category.category_Id.toString())}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="catalog-main">
            <header className="catalog-toolbar">
              <div className="catalog-toolbar-title">
                <h1>{activeCategoryName}</h1>
                <span className="results-count">
                  {loading ? 'Loading...' : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
                </span>
              </div>
              <div className="catalog-toolbar-actions">
                <div className="search-bar">
                  <SearchIcon size={18} className="search-icon" />
                  <input
                    type="search"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    aria-label="Search products"
                  />
                </div>
                <div className="sort-select-wrap">
                  <label htmlFor="sort-products">Sort</label>
                  <select
                    id="sort-products"
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="name">Name A–Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </header>

            {loading ? (
              <div className="catalog-skeleton-grid">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <ProductSkeleton key={n} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="catalog-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.product_Id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h3>No products found</h3>
                <p>Try adjusting your search or browse a different category.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Products;
