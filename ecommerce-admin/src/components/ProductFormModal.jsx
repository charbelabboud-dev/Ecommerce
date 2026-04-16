import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../contexts/ToastContexts.jsx';
import './ProductFormModal.css';

function ProductFormModal({ product, onSave, onClose, onRefresh }) {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    product_Name: '',
    product_Description: '',
    product_ShortDescription: '',
    product_PriceUSD: '',
    product_PriceLBP: '',
    product_Stock: '',
    product_SKU: '',
    product_IsActive: true,
    product_IsFeatured: false,
    product_CategoryId: ''
  });

  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch categories when modal opens
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setFormData({
        product_Name: product.product_Name || '',
        product_Description: product.product_Description || '',
        product_ShortDescription: product.product_ShortDescription || '',
        product_PriceUSD: product.product_PriceUSD || '',
        product_PriceLBP: product.product_PriceLBP || '',
        product_Stock: product.product_Stock || '',
        product_SKU: product.product_SKU || '',
        product_IsActive: product.product_IsActive !== undefined ? product.product_IsActive : true,
        product_IsFeatured: product.product_IsFeatured || false,
        product_CategoryId: product.product_CategoryId || ''
      });
      
      if (product.product_PriceUSD && product.product_PriceUSD > 0) {
        setCurrency('USD');
      } else if (product.product_PriceLBP && product.product_PriceLBP > 0) {
        setCurrency('LBP');
      } else {
        setCurrency('USD');
      }
    } else {
      setFormData({
        product_Name: '',
        product_Description: '',
        product_ShortDescription: '',
        product_PriceUSD: '',
        product_PriceLBP: '',
        product_Stock: '',
        product_SKU: '',
        product_IsActive: true,
        product_IsFeatured: false,
        product_CategoryId: ''
      });
      setCurrency('USD');
      setImageFile(null);
    }
  }, [product]);

  const handleRemoveImage = async () => {
    if (!product?.productImages?.[0]?.productImage_Id) return;
    
    if (window.confirm("Are you sure you want to remove this image?")) {
      try {
        await API.delete(`/upload/delete-image/${product.productImages[0].productImage_Id}`);
        addToast("Image removed successfully", "success");
        onRefresh();
        onClose();
      } catch (error) {
        console.error("Error removing image:", error);
        addToast("Failed to remove image", "error");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    
    const formData = new FormData();
    formData.append('productId', product?.product_Id || 0);
    formData.append('image', imageFile);
    formData.append('isMain', 'true');
    
    try {
      setUploading(true);
      const response = await API.post('/upload/product-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addToast("Image uploaded successfully!", "success");
      return response.data.image;
    } catch (error) {
      console.error('Upload error:', error);
      addToast("Failed to upload image", "error");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let uploadedImage = null;
    if (imageFile) {
      uploadedImage = await handleImageUpload();
    }
    
    const submitData = {
      product_Name: formData.product_Name,
       product_CategoryId: formData.product_CategoryId ? parseInt(formData.product_CategoryId) : null,
      product_Description: formData.product_Description || null,
      product_ShortDescription: formData.product_ShortDescription || null,
      product_PriceUSD: currency === 'USD' ? parseFloat(formData.product_PriceUSD) : null,
      product_PriceLBP: currency === 'LBP' ? parseFloat(formData.product_PriceLBP) : null,
      product_CompareAtPriceUSD: null,
      product_CompareAtPriceLBP: null,
      product_Stock: formData.product_Stock ? parseInt(formData.product_Stock) : 0,
      product_SKU: formData.product_SKU || null,
      product_IsActive: formData.product_IsActive,
      product_IsFeatured: formData.product_IsFeatured,
      product_CategoryId: formData.product_CategoryId ? parseInt(formData.product_CategoryId) : null
    };
    
    if (product) {
      submitData.product_Id = product.product_Id;
    }
    
    await onSave(submitData);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="product_Name"
              value={formData.product_Name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </div>
          
          {/* Category Dropdown */}
          <div className="form-group">
            <label>Category</label>
            <select
              name="product_CategoryId"
              value={formData.product_CategoryId}
              onChange={handleChange}
              className="category-select"
            >
              <option value="">-- Select Category --</option>
              {categories.map(category => (
                <option key={category.category_Id} value={category.category_Id}>
                  {category.category_Name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Image Upload */}
          <div className="form-group">
            <label>Product Image</label>
            <div className="image-upload-area">
              {(product?.productImages?.[0]?.productImage_ImageUrl && !imageFile) ? (
                <div className="current-image">
                  <img 
                    src={`http://localhost:5147${product.productImages[0].productImage_ImageUrl}`} 
                    alt="Current"
                    className="current-image-preview"
                  />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="imageUpload" className="upload-label">
                    📸 Click to upload image
                  </label>
                  {imageFile && <p className="file-name">Selected: {imageFile.name}</p>}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>Currency *</label>
            <div className="currency-buttons">
              <button
                type="button"
                className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
                onClick={() => setCurrency('USD')}
              >
                USD ($)
              </button>
              <button
                type="button"
                className={`currency-btn ${currency === 'LBP' ? 'active' : ''}`}
                onClick={() => setCurrency('LBP')}
              >
                LBP (ل.ل)
              </button>
            </div>
          </div>
          
          {currency === 'USD' ? (
            <div className="form-group">
              <label>Price (USD) *</label>
              <input
                type="number"
                name="product_PriceUSD"
                value={formData.product_PriceUSD}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Price (LBP) *</label>
              <input
                type="number"
                name="product_PriceLBP"
                value={formData.product_PriceLBP}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="product_Stock"
                value={formData.product_Stock}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>SKU (Optional)</label>
              <input
                type="text"
                name="product_SKU"
                value={formData.product_SKU}
                onChange={handleChange}
                placeholder="Product code"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Short Description</label>
            <textarea
              name="product_ShortDescription"
              value={formData.product_ShortDescription}
              onChange={handleChange}
              rows="2"
              placeholder="Brief description (shown in product cards)"
            />
          </div>
          
          <div className="form-group">
            <label>Full Description</label>
            <textarea
              name="product_Description"
              value={formData.product_Description}
              onChange={handleChange}
              rows="4"
              placeholder="Detailed product description"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="product_IsActive"
                  checked={formData.product_IsActive}
                  onChange={handleChange}
                />
                Active (visible to customers)
              </label>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="product_IsFeatured"
                  checked={formData.product_IsFeatured}
                  onChange={handleChange}
                />
                Featured (show on homepage)
              </label>
            </div>
          </div>
          
          <button type="submit" className="save-btn" disabled={loading || uploading}>
            {loading || uploading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProductFormModal;