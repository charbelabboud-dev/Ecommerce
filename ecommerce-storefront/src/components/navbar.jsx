import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getStoreSettings } from '../services/api';
import { CartIcon } from './Icons';

function Navbar() {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [storeName, setStoreName] = useState('MyStore');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const panelRef = useRef(null);       // reference to the mobile panel
  const toggleRef = useRef(null);      // reference to the hamburger button

  // Fetch store name
  useEffect(() => {
    const fetchStoreName = async () => {
      const settings = await getStoreSettings();
      if (settings?.storeName) {
        setStoreName(settings.storeName);
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

  // Close menu when clicking outside the panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customer');
    setIsLoggedIn(false);
    closeMenu();
    navigate('/');
  };

  const toggleMenu = () => {
    const willOpen = !isMenuOpen;
    setIsMenuOpen(willOpen);
    document.body.classList.toggle('menu-open', willOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.classList.remove('menu-open');
  };

  const handleLinkClick = () => {
    closeMenu();
  };

  return (
    <nav className="navbar">
      <div className="container">
                <Link to="/" className="navbar-brand">
          {storeName}
        </Link>

        <button 
          ref={toggleRef}
          className="mobile-menu-toggle" 
          onClick={toggleMenu}
          aria-label="Menu"
        >
          ☰
        </button>
        {/* Desktop navigation */}
        <div className="nav-links desktop-nav">
          <Link to="/products" className="nav-link">Products</Link>
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
          <Link to="/cart" className="cart-icon" aria-label="Shopping cart">
            <CartIcon size={22} />
            {getCartCount() > 0 && (
              <span className="cart-count">{getCartCount()}</span>
            )}
          </Link>
        </div>

        {/* Mobile slide-out panel - no overlay inside JSX */}
        <div ref={panelRef} className={`mobile-nav-panel ${isMenuOpen ? 'open' : ''}`}>
          <button className="mobile-menu-close" onClick={closeMenu}>✕</button>
          <div className="mobile-nav-links">
                        {isLoggedIn && (
              <>
                <span className="welcome-text">Hi, {customerName}</span>
                {/* <button onClick={handleLogout} className="logout-nav-btn">
                  Logout
                </button> */}
              </>
            )}
            <Link to="/products" className="nav-link" onClick={handleLinkClick}>Products</Link>
            <Link to="/wishlist" className="nav-link" onClick={handleLinkClick}>Wishlist</Link>
            {isLoggedIn && (
              <Link to="/orders" className="nav-link" onClick={handleLinkClick}>My Orders</Link>
            )}
            <Link to="/cart" className="cart-link" onClick={handleLinkClick}>
              <CartIcon size={18} /> Cart ({getCartCount()})
            </Link>
            {isLoggedIn ? (
              <>
                <button onClick={handleLogout} className="logout-nav-btn">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="login-link" onClick={handleLinkClick}>Login</Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;