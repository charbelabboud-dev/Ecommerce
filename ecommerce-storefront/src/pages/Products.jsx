import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import PageMeta from '../components/PageMeta';
import { SearchIcon, GridIcon } from '../components/Icons';
import { getUnitPrice } from '../utils/pricing';
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
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

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
    const min = priceMin !== '' ? parseFloat(priceMin) : null;
    const max = priceMax !== '' ? parseFloat(priceMax) : null;

    let result = products.filter(product => {
      const matchesSearch = product.product_Name.toLowerCase().includes(searchTerm.toLowerCase());
      const catId = parseInt(selectedCategory);
      const matchesCategory = selectedCategory === 'all'
        || product.product_CategoryId === catId
        || categories.some(c =>
          c.category_Id === catId &&
          (c.subcategories || []).some(s => s.category_Id === product.product_CategoryId)
        );
      const price = getUnitPrice(product);
      const matchesMin = min == null || price >= min;
      const matchesMax = max == null || price <= max;
      return matchesSearch && matchesCategory && matchesMin && matchesMax;
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
  }, [products, searchTerm, selectedCategory, sortBy, priceMin, priceMax, categories]);

  const getProductCount = (categoryId) => {
    if (categoryId === 'all') return products.length;
    const id = parseInt(categoryId);
    const parent = categories.find(c => c.category_Id === id);
    if (parent?.subcategories?.length) {
      const subIds = parent.subcategories.map(s => s.category_Id);
      return products.filter(p => subIds.includes(p.product_CategoryId) || p.product_CategoryId === id).length;
    }
    return products.filter(p => p.product_CategoryId === id).length;
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
                  <div key={category.category_Id} className="catalog-category-group">
                    <button
                      type="button"
                      className={`catalog-category-item ${selectedCategory === category.category_Id.toString() ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(category.category_Id.toString());
                        closeFilters();
                      }}
                    >
                      <span>{category.category_Name}</span>
                      <span className="count">{getProductCount(category.category_Id.toString())}</span>
                    </button>
                    {(category.subcategories || []).map(sub => (
                      <button
                        type="button"
                        key={sub.category_Id}
                        className={`catalog-category-item subcategory ${selectedCategory === sub.category_Id.toString() ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCategory(sub.category_Id.toString());
                          closeFilters();
                        }}
                      >
                        <span>{sub.category_Name}</span>
                        <span className="count">{getProductCount(sub.category_Id.toString())}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="catalog-filter-section">
              <h3>Price Range</h3>
              <div className="price-range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  min="0"
                  className="price-range-input"
                />
                <span>–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  min="0"
                  className="price-range-input"
                />
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
