import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../contexts/ToastContexts';
import './Coupons.css';

function Coupons() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    coupon_Code: '',
    coupon_DiscountPercent: '',
    coupon_DiscountAmountUSD: '',
    coupon_DiscountAmountLBP: '',
    coupon_MinOrderAmountUSD: '',
    coupon_MinOrderAmountLBP: '',
    coupon_UsageLimit: '',
    coupon_IsActive: true,
    coupon_ExpiresAt: ''
  });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const response = await API.get('/coupons');
      setCoupons(response.data);
    } catch (error) {
      addToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        coupon_Code: formData.coupon_Code,
        coupon_DiscountPercent: formData.coupon_DiscountPercent !== '' ? parseFloat(formData.coupon_DiscountPercent) : null,
        coupon_DiscountAmountUSD: formData.coupon_DiscountAmountUSD !== '' ? parseFloat(formData.coupon_DiscountAmountUSD) : null,
        coupon_DiscountAmountLBP: formData.coupon_DiscountAmountLBP !== '' ? parseFloat(formData.coupon_DiscountAmountLBP) : null,
        coupon_MinOrderAmountUSD: formData.coupon_MinOrderAmountUSD !== '' ? parseFloat(formData.coupon_MinOrderAmountUSD) : null,
        coupon_MinOrderAmountLBP: formData.coupon_MinOrderAmountLBP !== '' ? parseFloat(formData.coupon_MinOrderAmountLBP) : null,
        coupon_UsageLimit: formData.coupon_UsageLimit !== '' ? parseInt(formData.coupon_UsageLimit, 10) : null,
        coupon_IsActive: formData.coupon_IsActive,
        coupon_ExpiresAt: formData.coupon_ExpiresAt ? new Date(formData.coupon_ExpiresAt).toISOString() : null
      };
      await API.post('/coupons', payload);
      addToast('Coupon created', 'success');
      setShowModal(false);
      setFormData({ coupon_Code: '', coupon_DiscountPercent: '', coupon_DiscountAmountUSD: '', coupon_DiscountAmountLBP: '', coupon_MinOrderAmountUSD: '', coupon_MinOrderAmountLBP: '', coupon_UsageLimit: '', coupon_IsActive: true, coupon_ExpiresAt: '' });
      fetchCoupons();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create coupon', 'error');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon ${code}?`)) return;
    try {
      await API.delete(`/coupons/${id}`);
      addToast('Coupon deleted', 'success');
      fetchCoupons();
    } catch (error) {
      addToast('Failed to delete coupon', 'error');
    }
  };

  return (
    <div className="coupons-container">
      <div className="coupons-header">
        <button className="back-button" onClick={() => navigate('/')}>← Back</button>
        <h1>Promo Codes</h1>
        <button className="add-button" onClick={() => setShowModal(true)}>+ Add Coupon</button>
      </div>

      {loading ? <p className="coupons-empty">Loading...</p> : coupons.length === 0 ? (
        <p className="coupons-empty">No promo codes yet. Click &quot;+ Add Coupon&quot; to create one.</p>
      ) : (
        <div className="coupons-table-container">
        <table className="coupons-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Used</th>
              <th>Expires</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.coupon_Id}>
                <td data-label="Code"><strong className="cell-value">{c.coupon_Code}</strong></td>
                <td data-label="Discount">
                  <span className="cell-value">
                  {c.coupon_DiscountPercent ? `${c.coupon_DiscountPercent}%` :
                    c.coupon_DiscountAmountUSD ? `$${c.coupon_DiscountAmountUSD}` :
                    c.coupon_DiscountAmountLBP ? `${c.coupon_DiscountAmountLBP} LBP` : '—'}
                  </span>
                </td>
                <td data-label="Used"><span className="cell-value">{c.coupon_UsedCount}{c.coupon_UsageLimit ? ` / ${c.coupon_UsageLimit}` : ''}</span></td>
                <td data-label="Expires"><span className="cell-value">{c.coupon_ExpiresAt ? new Date(c.coupon_ExpiresAt).toLocaleDateString() : 'Never'}</span></td>
                <td data-label="Status"><span className="cell-value">{c.coupon_IsActive ? 'Active' : 'Inactive'}</span></td>
                <td data-label="Actions">
                  <button className="delete-btn" onClick={() => handleDelete(c.coupon_Id, c.coupon_Code)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Coupon</h2>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Code *</label>
                <input name="coupon_Code" value={formData.coupon_Code} onChange={handleChange} required placeholder="SUMMER20" />
              </div>
              <div className="form-group">
                <label>Discount % (or use fixed amount below)</label>
                <input type="number" name="coupon_DiscountPercent" value={formData.coupon_DiscountPercent} onChange={handleChange} min="0" max="100" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fixed USD off</label>
                  <input type="number" name="coupon_DiscountAmountUSD" value={formData.coupon_DiscountAmountUSD} onChange={handleChange} step="0.01" />
                </div>
                <div className="form-group">
                  <label>Fixed LBP off</label>
                  <input type="number" name="coupon_DiscountAmountLBP" value={formData.coupon_DiscountAmountLBP} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Min order USD</label>
                  <input type="number" name="coupon_MinOrderAmountUSD" value={formData.coupon_MinOrderAmountUSD} onChange={handleChange} step="0.01" />
                </div>
                <div className="form-group">
                  <label>Usage limit</label>
                  <input type="number" name="coupon_UsageLimit" value={formData.coupon_UsageLimit} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Expires at</label>
                <input type="datetime-local" name="coupon_ExpiresAt" value={formData.coupon_ExpiresAt} onChange={handleChange} />
              </div>
              <button type="submit" className="save-btn">Create Coupon</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Coupons;
