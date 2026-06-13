import React from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found-page">
      <PageMeta
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
        path="/404"
      />
      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <Link to="/" className="shop-now-btn">Go Home</Link>
          <Link to="/products" className="btn-secondary">Browse Products</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
