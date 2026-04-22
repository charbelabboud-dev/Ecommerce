import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    setLoading(false);
    return;
  }

  if (formData.password.length < 6) {
    setError('Password must be at least 6 characters');
    setLoading(false);
    return;
  }

  try {
    await API.post('/customerauth/register', {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address
    });

    // Redirect to OTP verification page
    navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  if (success) {
    return (
      <div className="container">
        <div className="register-success">
          <div className="success-icon">✓</div>
          <h2>Registration Successful!</h2>
          <p>We've sent a verification code to <strong>{registeredEmail}</strong></p>
          <p>Please enter the 6-digit OTP to verify your email.</p>
          <Link to={`/verify-otp?email=${encodeURIComponent(registeredEmail)}`} className="verify-btn">
            Verify Email
          </Link>
          <Link to="/login" className="login-link">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="register-container">
        <h1>Create Account</h1>
        <p className="subtitle">Join us and start shopping</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Minimum 6 characters"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+961 00 000 000"
              />
            </div>
            <div className="form-group">
              <label>Address (Optional)</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your delivery address"
              />
            </div>
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="login-redirect">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;