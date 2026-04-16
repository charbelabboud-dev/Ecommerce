import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function Navbar() {
  const { getCartCount } = useCart();

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          🛍️ MyStore
        </Link>
        <div className="nav-links">
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/track-order" className="nav-link">Track Order</Link>
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