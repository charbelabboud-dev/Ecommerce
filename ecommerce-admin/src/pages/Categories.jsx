import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../contexts/ToastContexts';
import './Categories.css';

function Categories() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    category_Name: '',
    category_Description: '',
    category_DisplayOrder: 0,
    category_IsActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await API.get('/categories/all');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      addToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        category_Name: category.category_Name,
        category_Description: category.category_Description || '',
        category_DisplayOrder: category.category_DisplayOrder,
        category_IsActive: category.category_IsActive
      });
    } else {
      setEditingCategory(null);
      setFormData({
        category_Name: '',
        category_Description: '',
        category_DisplayOrder: 0,
        category_IsActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCategory) {
        await API.put(`/categories/${editingCategory.category_Id}`, formData);
        addToast('Category updated successfully', 'success');
      } else {
        await API.post('/categories', formData);
        addToast('Category created successfully', 'success');
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      addToast(error.response?.data || 'Failed to save category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await API.delete(`/categories/${id}`);
        addToast('Category deleted successfully', 'success');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        addToast(error.response?.data || 'Failed to delete category', 'error');
      }
    }
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="categories-container">
      <div className="categories-header">
        <div className="header-left">
          <button className="back-button" onClick={goBack}>
            ← Back
          </button>
          <h1>Manage Categories</h1>
        </div>
        <button className="add-button" onClick={() => handleOpenModal()}>
          + Add Category
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading categories...</div>
      ) : (
        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Display Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.category_Id}>
                    <td data-label="Name">{category.category_Name}</td>
                    <td data-label="Slug">{category.category_Slug}</td>
                    <td data-label="Description">{category.category_Description || '-'}</td>
                    <td data-label="Display Order">{category.category_DisplayOrder}</td>
                    <td data-label="Status">
                      <span className={category.category_IsActive ? 'status-active' : 'status-inactive'}>
                        {category.category_IsActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <button className="edit-btn" onClick={() => handleOpenModal(category)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(category.category_Id, category.category_Name)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  name="category_Name"
                  value={formData.category_Name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Electronics, Clothing, Food"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="category_Description"
                  value={formData.category_Description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Optional description"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    name="category_DisplayOrder"
                    value={formData.category_DisplayOrder}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="category_IsActive"
                      checked={formData.category_IsActive}
                      onChange={handleChange}
                    />
                    Active (visible to customers)
                  </label>
                </div>
              </div>
              <button type="submit" className="save-btn" disabled={submitting}>
                {submitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;