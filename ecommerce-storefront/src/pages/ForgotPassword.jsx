import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { getApiErrorMessage } from '../utils/apiErrors';
import PageMeta from '../components/PageMeta';
import './CustomerLogin.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await API.post('/customerauth/forgot-password', { email });
      setMessage(response.data.message);
      setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 1500);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <PageMeta title="Forgot Password" description="Reset your account password." path="/forgot-password" />
      <div className="login-container">
        <h1>Forgot Password</h1>
        <p className="subtitle">Enter the email linked to your account. We'll verify it and send a reset code.</p>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>

        <div className="login-footer">
          <p><Link to="/login">Back to Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
