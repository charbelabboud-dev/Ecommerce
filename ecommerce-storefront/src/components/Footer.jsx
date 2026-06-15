import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStoreSettings } from '../services/api';
import { PhoneIcon, MapPinIcon } from './Icons';
import { scrollToTop } from './ScrollToTop';
import './Footer.css';

function FooterLink({ to, children }) {
  return (
    <Link to={to} onClick={() => scrollToTop()}>
      {children}
    </Link>
  );
}

function Footer() {
  const [store, setStore] = useState({
    storeName: 'MyStore',
    storePhone: '',
    storeAddress: ''
  });

  useEffect(() => {
    const load = async () => {
      const settings = await getStoreSettings();
      if (settings) {
        setStore({
          storeName: settings.storeName || 'MyStore',
          storePhone: settings.storePhone || '',
          storeAddress: settings.storeAddress || ''
        });
        document.documentElement.dataset.siteName = settings.storeName || 'Shop';
      }
    };
    load();
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo" onClick={() => scrollToTop()}>
              {store.storeName}
            </Link>
            <p className="footer-tagline">
              Quality products and trusted service — delivered to your door across Lebanon.
            </p>
            {(store.storePhone || store.storeAddress) && (
              <div className="footer-contact-list">
                {store.storePhone && (
                  <p className="footer-contact-item">
                    <PhoneIcon />
                    <span>{store.storePhone}</span>
                  </p>
                )}
                {store.storeAddress && (
                  <p className="footer-contact-item">
                    <MapPinIcon />
                    <span>{store.storeAddress}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="footer-links">
            <h4>Shop</h4>
            <FooterLink to="/products">All Products</FooterLink>
            <FooterLink to="/cart">Cart</FooterLink>
            <FooterLink to="/wishlist">Wishlist</FooterLink>
          </div>

          <div className="footer-links">
            <h4>Account</h4>
            <FooterLink to="/login">Sign In</FooterLink>
            <FooterLink to="/register">Create Account</FooterLink>
          </div>

          <div className="footer-links">
            <h4>Help</h4>
            <FooterLink to="/contact">Contact Us</FooterLink>
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
            <FooterLink to="/terms">Terms of Service</FooterLink>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {year} {store.storeName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
