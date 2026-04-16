import React from 'react';
import { Link } from 'react-router-dom';

function OrderSuccess() {
  return (
    <div className="container">
      <div className="order-success">
        <div className="success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for your purchase. Your order has been received and will be processed shortly.</p>
        <div className="success-message">
          <p>You will receive a confirmation call on your phone number for delivery details.</p>
          <p>Payment will be collected upon delivery (Cash on Delivery).</p>
        </div>
        <div className="success-actions">
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
          <Link to="/" className="home-link">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;