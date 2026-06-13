import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { getApiErrorMessage } from '../utils/apiErrors';
import PasswordInput from '../components/PasswordInput';
import PageMeta from '../components/PageMeta';
import './CustomerLogin.css';

const MIN_PASSWORD_LENGTH = 8;

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    otpCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await API.post('/customerauth/reset-password', {
        email: formData.email,
        otpCode: formData.otpCode,
        newPassword: formData.newPassword
      });
      alert(response.data.message);
      navigate('/login');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reset password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <PageMeta title="Reset Password" description="Enter your reset code and new password." path="/reset-password" />
      <div className="login-container">
        <h1>Reset Password</h1>
        <p className="subtitle">Enter the code from your email and choose a new password</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Reset Code</label>
            <input
              type="text"
              name="otpCode"
              value={formData.otpCode}
              onChange={handleChange}
              required
              maxLength={6}
              placeholder="6-digit code"
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <PasswordInput
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength={MIN_PASSWORD_LENGTH}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <PasswordInput
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={MIN_PASSWORD_LENGTH}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="login-footer">
          <p><Link to="/forgot-password">Request a new code</Link></p>
          <p><Link to="/login">Back to Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
