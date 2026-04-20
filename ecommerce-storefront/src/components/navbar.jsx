import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import API, { getStoreSettings } from '../services/api';

function Navbar() {
  const { getCartCount } = useCart();
  const [storeName, setStoreName] = useState('MyStore');

  useEffect(() => {
    const fetchStoreName = async () => {
      const settings = await getStoreSettings();
      if (settings && settings.adminUser_StoreName) {
        setStoreName(settings.adminUser_StoreName);
      }
    };
    fetchStoreName();
  }, []);

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