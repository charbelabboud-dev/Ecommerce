import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getStoreSettings } from '../services/api';

function Navbar() {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [storeName, setStoreName] = useState('MyStore');

  // Fetch store name
  useEffect(() => {
    const fetchStoreName = async () => {
      const settings = await getStoreSettings();
      if (settings && settings.adminUser_StoreName) {
        setStoreName(settings.adminUser_StoreName);
      }
    };
    fetchStoreName();
  }, []);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    const customer = localStorage.getItem('customer');
    if (token && customer) {
      setIsLoggedIn(true);
      const customerData = JSON.parse(customer);
      setCustomerName(customerData.customer_Name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customer');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          🛍️ {storeName}
        </Link>
        <div className="nav-links">
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/track-order" className="nav-link">Track Order</Link>
          <Link to="/wishlist" className="nav-link">Wishlist</Link>
          {isLoggedIn && (
            <Link to="/orders" className="nav-link">My Orders</Link>
          )}
          {isLoggedIn ? (
            <>
              <span className="welcome-text">Hi, {customerName}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
          <Link to="/cart" className="cart-icon">
            🛒
            {getCartCount() > 0 && (
              <span className="cart-count">{getCartCount()}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;