import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function Navbar() {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const checkLoginStatus = () => {
    const token = localStorage.getItem('customerToken');
    const customer = localStorage.getItem('customer');
    if (token && customer) {
      setIsLoggedIn(true);
      const customerData = JSON.parse(customer);
      setCustomerName(customerData.customer_Name);
    } else {
      setIsLoggedIn(false);
      setCustomerName('');
    }
  };

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customer');
    setIsLoggedIn(false);
    setCustomerName('');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* Left - Logo */}
        <Link to="/" className="navbar-brand">
          🛍️ MyStore
        </Link>
        
        {/* Center - Welcome Name */}
        {isLoggedIn && (
          <div className="nav-center">
            <span className="welcome-text">Welcome, {customerName}</span>
          </div>
        )}
        
        {/* Right - Navigation + Cart + Logout */}
        <div className="nav-right">
          <div className="nav-links">
            <Link to="/products" className="nav-link">Products</Link>
            {/* <Link to="/track-order" className="nav-link">Track Order</Link> */}
            <Link to="/wishlist" className="nav-link">Wishlist</Link>
          </div>
          
            {isLoggedIn && (
    <Link to="/orders" className="nav-link">My Orders</Link>
  )}
          <Link to="/cart" className="cart-icon">
            🛒
            {getCartCount() > 0 && (
              <span className="cart-count">{getCartCount()}</span>
            )}
          </Link>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          ) : (
            <Link to="/login" className="login-link">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;