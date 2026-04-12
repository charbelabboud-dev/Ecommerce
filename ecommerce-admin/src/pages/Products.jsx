import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../contexts/ToastContexts';
import ProductFormModal from '../components/ProductFormModal';
import './Products.css';

function Products() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // Function to fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await API.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      addToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on selection and search
  const getFilteredProducts = () => {
    let filtered = products;
    
    // Apply status filter
    if (filter === 'active') {
      filtered = filtered.filter(p => p.product_IsActive === true);
    }
    if (filter === 'inactive') {
      filtered = filtered.filter(p => p.product_IsActive === false);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.product_Name.toLowerCase().includes(term) ||
        (p.product_SKU && p.product_SKU.toLowerCase().includes(term)) ||
        (p.product_Description && p.product_Description.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // Function to handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await API.delete(`/products/${id}`);
        addToast("Product deleted successfully", "success");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        addToast("Failed to delete product", "error");
      }
    }
  };

  // Function to open modal for add
  const handleAdd = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  // Function to open modal for edit
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  // Function to close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  // Function to save product (add or update)
  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        const updateData = {
          ...productData,
          product_Id: editingProduct.product_Id
        };
        
        await API.put(`/products/${editingProduct.product_Id}`, updateData);
        addToast("Product updated successfully", "success");
      } else {
        await API.post("/products", productData);
        addToast("Product created successfully", "success");
      }
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      const errorMessage = error.response?.data || "Failed to save product";
      addToast(errorMessage, "error");
    }
  };

  // Navigate back to dashboard
  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <div className="header-left">
          <button className="back-button" onClick={goBack}>
            ← Back
          </button>
          <h1>Manage Products</h1>
        </div>
        <div className="header-right">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({products.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({products.filter(p => p.product_IsActive === true).length})
            </button>
            <button 
              className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilter('inactive')}
            >
              Inactive ({products.filter(p => p.product_IsActive === false).length})
            </button>
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
            )}
          </div>
          <button className="add-button" onClick={handleAdd}>
            + Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    {products.length === 0 
                      ? 'No products found. Click "Add Product" to create one.' 
                      : `No ${filter !== 'all' ? filter : ''} products match your search.`}
                    </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.product_Id}>
                    <td className="product-image-cell">
                      {product.productImages && product.productImages.length > 0 ? (
                        <img 
                          src={`http://localhost:5147${product.productImages[0].productImage_ImageUrl}`} 
                          alt={product.product_Name}
                          className="product-image-thumb"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="product-image-placeholder">No Image</div>
                      )}
                    </td>
                    <td className="product-name-cell">{product.product_Name}</td>
                    <td className="product-price-cell">
                      {product.product_PriceUSD 
                        ? `$${product.product_PriceUSD.toFixed(2)}` 
                        : product.product_PriceLBP 
                          ? `${product.product_PriceLBP.toFixed(2)} LBP`
                          : 'N/A'}
                    </td>
                    <td>{product.product_Stock}</td>
                    <td>
                      <span className={product.product_IsActive ? 'status-active' : 'status-inactive'}>
                        {product.product_IsActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="product-actions">
                      <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(product.product_Id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={handleCloseModal}
          onRefresh={fetchProducts}
        />
      )}
    </div>
  );
}

export default Products;