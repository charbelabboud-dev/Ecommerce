import React, { useEffect, useState } from 'react';
import API, { getStoreSettings } from '../services/api';
import PageMeta from '../components/PageMeta';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [store, setStore] = useState({ storeName: 'MyStore', storePhone: '', storeAddress: '' });

  useEffect(() => {
    getStoreSettings().then((settings) => {
      if (settings) setStore(settings);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.post('/contact', formData);
      setSuccess(response.data.message);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <PageMeta
        title="Contact Us"
        description={`Get in touch with ${store.storeName}. We're here to help with orders, products, and support.`}
        path="/contact"
      />
      <div className="container contact-layout">
        <div className="contact-info">
          <h1>Contact Us</h1>
          <p>Have a question about an order or product? Send us a message and we'll respond as soon as we can.</p>
          {store.storePhone && (
            <div className="contact-detail">
              <strong>Phone</strong>
              <span>{store.storePhone}</span>
            </div>
          )}
          {store.storeAddress && (
            <div className="contact-detail">
              <strong>Address</strong>
              <span>{store.storeAddress}</span>
            </div>
          )}
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label>Subject (optional)</label>
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} placeholder="Tell us more..." />
          </div>
          <button type="submit" className="shop-now-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;
