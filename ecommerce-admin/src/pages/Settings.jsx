import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../contexts/ToastContexts';
import './Settings.css';

import { updateAdmin } from '../services/authStore';

function Settings({ onAdminUpdate }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    storePhone: '',
    storeAddress: '',
    email: '',
    storeLogo: '',
    shippingFeeUSD: '',    // ← ADD THIS
    shippingFeeLBP: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

const fetchSettings = async () => {
  try {
    setLoading(true);
    const response = await API.get('/adminusers/settings');
    const data = response.data;
    console.log("Settings data:", data); // Debug
    
    setFormData({
      storeName: data.adminUser_StoreName || '',
      storePhone: data.adminUser_StorePhone || '',
      storeAddress: data.adminUser_StoreAddress || '',
      email: data.adminUser_Email || '',
      storeLogo: data.adminUser_StoreLogo || '',
        shippingFeeUSD: data.adminUser_ShippingFeeUSD || 0, 
  shippingFeeLBP: data.adminUser_ShippingFeeLBP || 0 
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    addToast('Failed to load settings', 'error');
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };



const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    const payload = {
      storeName: formData.storeName,
      storePhone: formData.storePhone,
      storeAddress: formData.storeAddress,
      email: formData.email,
      storeLogo: formData.storeLogo
    };
    console.log("Saving payload:", payload); // Debug
    
    const response = await API.put('/adminusers/settings', payload);
    console.log("Save response:", response.data); // Debug
    
    addToast('Settings updated successfully!', 'success');

    const adminUpdates = {
      adminUser_StoreName: formData.storeName,
      adminUser_StorePhone: formData.storePhone,
      adminUser_StoreAddress: formData.storeAddress,
      adminUser_Email: formData.email,
      adminUser_StoreLogo: formData.storeLogo,
    };
    updateAdmin(adminUpdates);
    onAdminUpdate?.(adminUpdates);
    
  } catch (error) {
    console.error('Error saving settings:', error);
    addToast('Failed to save settings', 'error');
  } finally {
    setSaving(false);
  }
};

  const goBack = () => {
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="header-left">
          <button className="back-button" onClick={goBack}>
            ← Back
          </button>
          <h1>Shop Settings</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-section">
          <h3>Store Information</h3>
          
          <div className="form-group">
            <label>Store Name</label>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              placeholder="Enter store name"
              required
            />
          </div>

          <div className="form-group">
            <label>Store Phone</label>
            <input
              type="tel"
              name="storePhone"
              value={formData.storePhone}
              onChange={handleChange}
              placeholder="+961 00 000 000"
              required
            />
          </div>

          <div className="form-group">
            <label>Store Address</label>
            <textarea
              name="storeAddress"
              value={formData.storeAddress}
              onChange={handleChange}
              rows="3"
              placeholder="Enter store address"
              required
            />
          </div>

          <div className="form-group">
            <label>Store Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="info@mystore.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Store Logo URL (Optional)</label>
            <input
              type="text"
              name="storeLogo"
              value={formData.storeLogo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
            <small>Enter a URL for your store logo</small>
          </div>
        </div>

        <button type="submit" className="save-settings-btn" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

export default Settings;