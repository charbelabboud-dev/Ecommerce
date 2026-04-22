import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import './VerifyOtp.css';

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      // Verify OTP
      await API.post('/customerauth/verify-otp', {
        email: email,
        otpCode: otp
      });
      
      // Auto-login after successful verification
      const loginResponse = await API.post('/customerauth/auto-login-after-verify', {
        email: email
      });
      
      const { token, customer } = loginResponse.data;
      
      // Save token and customer info
      localStorage.setItem('customerToken', token);
      localStorage.setItem('customer', JSON.stringify(customer));
      
      // Redirect to home page
      navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError('');
    try {
      await API.post('/customerauth/resend-otp', {
        email: email
      });
      alert('New OTP sent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container">
      <div className="verify-container">
        <h1>Verify Your Email</h1>
        <p className="subtitle">
          We've sent a 6-digit verification code to
          <br />
          <strong>{email || 'your email'}</strong>
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="verify-form">
          <div className="form-group">
            <label>Enter OTP Code</label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              className="otp-input"
              autoFocus
            />
          </div>

          <button type="submit" className="verify-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="resend-section">
          <p>Didn't receive the code?</p>
          <button onClick={handleResendOtp} disabled={resending} className="resend-btn">
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>

        <Link to="/login" className="back-to-login">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

export default VerifyOtp;