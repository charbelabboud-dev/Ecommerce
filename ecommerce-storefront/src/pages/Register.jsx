import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { getApiErrorMessage } from '../utils/apiErrors';
import { useToast } from '../contexts/ToastContext';
import PasswordInput from '../components/PasswordInput';
import './Register.css';

const MIN_PASSWORD_LENGTH = 8;
const MIN_PHONE_LENGTH = 7;

function Register() {
  const navigate = useNavigate();
  const { addToast } = useToast();
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

  if (formData.password.length < MIN_PASSWORD_LENGTH) {
    setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    setLoading(false);
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    setLoading(false);
    return;
  }

  const phoneDigits = formData.phone.replace(/\D/g, '');
  if (phoneDigits.length < MIN_PHONE_LENGTH) {
    setError(`Phone number must be at least ${MIN_PHONE_LENGTH} digits`);
    setLoading(false);
    return;
  }

  try {
    const response = await API.post('/customerauth/register', {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address
    });

    const email = response.data.email || formData.email;
    addToast(response.data.message || 'Account created! Check your email for the verification code.', 'success');
    navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    
  } catch (err) {
    setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
  } finally {
    setLoading(false);
  }
};

  if (success) {
    return (
      <div className="register-page">
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
    <div className="register-page">
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
              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={MIN_PASSWORD_LENGTH}
                placeholder={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <PasswordInput
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={MIN_PASSWORD_LENGTH}
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                minLength={MIN_PHONE_LENGTH}
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
            {loading ? 'Creating account...' : 'Register'}
          </button>
          {loading && (
            <p className="register-loading-note">Setting up your account — you'll be redirected to verify your email.</p>
          )}
        </form>

        <p className="login-redirect">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;