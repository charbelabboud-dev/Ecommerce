import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { getApiErrorMessage } from '../utils/apiErrors';
import PasswordInput from '../components/PasswordInput';
import PageMeta from '../components/PageMeta';
import './CustomerLogin.css';

function CustomerLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await API.post('/customerauth/login', {
      email: formData.email,
      password: formData.password
    });

    const { token, customer } = response.data;
    
    localStorage.setItem('customerToken', token);
    localStorage.setItem('customer', JSON.stringify(customer));
    
    // Force a page reload to update Navbar
    window.location.href = '/';
    
  } catch (err) {
    const data = err.response?.data;
    if (data?.requiresVerification && formData.email) {
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      return;
    }
    setError(getApiErrorMessage(err, 'Login failed. Please try again.'));
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-page">
      <PageMeta title="Sign In" description="Sign in to your account to shop and view order history." path="/login" />
      <div className="login-container">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CustomerLogin;