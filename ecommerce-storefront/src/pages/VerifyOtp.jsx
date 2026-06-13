import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../services/api';
import { getApiErrorMessage } from '../utils/apiErrors';
import './VerifyOtp.css';

function VerifyOtp() {
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
    if (params.get('emailSent') === 'false') {
      setInfo('We could not send the verification email. Click Resend OTP below, or check the API terminal if you are running locally.');
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
      const response = await API.post('/customerauth/verify-otp', {
        email: email,
        otpCode: otp
      });

      const { token, customer } = response.data;
      
      // Save token and customer info
      localStorage.setItem('customerToken', token);
      localStorage.setItem('customer', JSON.stringify(customer));

      // Full reload so navbar picks up the new session (same as login)
      window.location.href = '/';
      
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError('');
    try {
      const response = await API.post('/customerauth/resend-otp', { email });
      if (response.data.emailSent === false) {
        setInfo(response.data.message || 'Email could not be sent. Check the API terminal for your code if running locally.');
        setError('');
      } else {
        setInfo('A new verification code was sent to your email.');
        setError('');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to resend OTP. Please try again.'));
      setInfo('');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        <h1>Verify Your Email</h1>
        <p className="subtitle">
          We've sent a 6-digit verification code to
          <br />
          <strong>{email || 'your email'}</strong>
        </p>

        {info && <div className="info-message">{info}</div>}
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