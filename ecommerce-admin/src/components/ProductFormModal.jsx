import React, { useState, useEffect } from 'react';
import API, { getImageUrl } from '../services/api';
import { useToast } from '../contexts/ToastContexts';
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
    product_CategoryId: '',
    product_ShippingFee: '',
    product_DiscountPercent: ''
  });
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch categories
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

  // Fetch existing images when editing
  useEffect(() => {
    if (product?.product_Id) {
      fetchProductImages();
    } else {
      setProductImages([]);
    }
  }, [product]);

  const fetchProductImages = async () => {
    try {
      const response = await API.get(`/upload/product-images/${product.product_Id}`);
      setProductImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

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
        product_CategoryId: product.product_CategoryId || '',
        product_ShippingFee: product.product_ShippingFee || '',
        product_DiscountPercent: product.product_DiscountPercent ?? ''
      });
      if (product.product_PriceUSD && product.product_PriceUSD > 0) setCurrency('USD');
      else if (product.product_PriceLBP && product.product_PriceLBP > 0) setCurrency('LBP');
      else setCurrency('USD');
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
        product_CategoryId: '',
        product_ShippingFee: '',
        product_DiscountPercent: ''
      });
      setCurrency('USD');
      setImageFile(null);
      setProductImages([]);
    }
  }, [product]);

  const handleRemoveImage = async () => {
    if (!product?.productImages?.[0]?.productImage_Id) return;
    if (window.confirm("Remove this image?")) {
      try {
        await API.delete(`/upload/delete-image/${product.productImages[0].productImage_Id}`);
        addToast("Image removed", "success");
        onRefresh();
        onClose();
      } catch (error) {
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (!product?.product_Id) {
      addToast('Save the product first, then upload images', 'error');
      e.target.value = '';
      return;
    }

    setUploadingImage(true);
    let uploaded = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('productId', product.product_Id);
        formData.append('image', files[i]);
        formData.append('isMain', productImages.length === 0 && i === 0);

        await API.post('/upload/product-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploaded++;
      }

      addToast(`${uploaded} image${uploaded > 1 ? 's' : ''} uploaded`, 'success');
      fetchProductImages();
      onRefresh?.();
    } catch (error) {
      addToast('Upload failed', 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Remove this image?')) return;
    try {
      await API.delete(`/upload/delete-image/${imageId}`);
      addToast('Image deleted', 'success');
      fetchProductImages();
      onRefresh();
    } catch (error) {
      addToast('Delete failed', 'error');
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      await API.put(`/upload/set-main-image/${imageId}`);
      addToast('Main image updated', 'success');
      fetchProductImages();
      onRefresh();
    } catch (error) {
      addToast('Failed to set main image', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      product_Name: formData.product_Name,
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
      product_CategoryId: formData.product_CategoryId ? parseInt(formData.product_CategoryId) : null,
      product_ShippingFee: formData.product_ShippingFee ? parseFloat(formData.product_ShippingFee) : null,
      product_DiscountPercent: formData.product_DiscountPercent !== ''
        ? Math.min(100, Math.max(0, parseFloat(formData.product_DiscountPercent)))
        : null
    };
    if (product) submitData.product_Id = product.product_Id;

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
            <input type="text" name="product_Name" value={formData.product_Name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="product_CategoryId" value={formData.product_CategoryId} onChange={handleChange}>
              <option value="">-- Select Category --</option>
              {categories.map(cat => (
                <option key={cat.category_Id} value={cat.category_Id}>{cat.category_Name}</option>
              ))}
            </select>
          </div>

          {/* Multi‑image manager */}
          <div className="form-group">
            <label>Product Images {productImages.length > 0 && `(${productImages.length})`}</label>
            {!product?.product_Id && (
              <p className="image-hint">Save the product first — the form will stay open so you can add multiple photos.</p>
            )}
            <div className="image-manager">
              <div className="current-images">
                {productImages.map(img => (
                  <div key={img.productImage_Id} className="image-item">
                    <img src={getImageUrl(img.productImage_ImageUrl)} alt="" />
                    <div className="image-actions">
                      {!img.productImage_IsMain && (
                        <button type="button" onClick={() => handleSetMainImage(img.productImage_Id)}>Main</button>
                      )}
                      <button type="button" className="delete-img" onClick={() => handleDeleteImage(img.productImage_Id)}>🗑️</button>
                    </div>
                    {img.productImage_IsMain && <span className="main-badge">Main</span>}
                  </div>
                ))}
              </div>
              <div className="upload-new">
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImage || !product?.product_Id} />
                <span className="upload-hint">Select multiple images at once (JPG, PNG, WebP — max 5MB each)</span>
                {uploadingImage && <span>Uploading...</span>}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Currency *</label>
            <div className="currency-buttons">
              <button type="button" className={`currency-btn ${currency === 'USD' ? 'active' : ''}`} onClick={() => setCurrency('USD')}>USD ($)</button>
              <button type="button" className={`currency-btn ${currency === 'LBP' ? 'active' : ''}`} onClick={() => setCurrency('LBP')}>LBP (ل.ل)</button>
            </div>
          </div>

          {currency === 'USD' ? (
            <div className="form-group">
              <label>Price (USD) *</label>
              <input type="number" name="product_PriceUSD" value={formData.product_PriceUSD} onChange={handleChange} step="0.01" required />
            </div>
          ) : (
            <div className="form-group">
              <label>Price (LBP) *</label>
              <input type="number" name="product_PriceLBP" value={formData.product_PriceLBP} onChange={handleChange} step="0.01" required />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Stock</label>
              <input type="number" name="product_Stock" value={formData.product_Stock} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>SKU (Optional)</label>
              <input type="text" name="product_SKU" value={formData.product_SKU} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Shipping Fee</label>
            <input type="number" name="product_ShippingFee" value={formData.product_ShippingFee} onChange={handleChange} step="0.01" />
          </div>

          <div className="form-group">
            <label>Product Discount (%)</label>
            <input
              type="number"
              name="product_DiscountPercent"
              value={formData.product_DiscountPercent}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              placeholder="e.g. 15 — leave empty for no product discount"
            />
            <span className="upload-hint">Overrides category discount when set. Category discount applies if this is empty.</span>
          </div>

          <div className="form-group">
            <label>Short Description</label>
            <textarea name="product_ShortDescription" value={formData.product_ShortDescription} onChange={handleChange} rows="2" />
          </div>
          <div className="form-group">
            <label>Full Description</label>
            <textarea name="product_Description" value={formData.product_Description} onChange={handleChange} rows="4" />
          </div>

          <div className="form-row">
            <div className="checkbox">
              <label><input type="checkbox" name="product_IsActive" checked={formData.product_IsActive} onChange={handleChange} /> Active</label>
            </div>
            <div className="checkbox">
              <label><input type="checkbox" name="product_IsFeatured" checked={formData.product_IsFeatured} onChange={handleChange} /> Featured</label>
            </div>
          </div>

          <button type="submit" className="save-btn" disabled={loading || uploadingImage}>
            {loading ? 'Saving...' : (product ? 'Update' : 'Create')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProductFormModal;