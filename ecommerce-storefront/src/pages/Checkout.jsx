import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import API from '../services/api';

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, getCartCount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    notes: ''
  });

  const getCurrency = () => {
    const firstItem = cartItems[0];
    return firstItem?.product_PriceUSD ? 'USD' : 'LBP';
  };

  const getSubtotal = () => {
    return getCartTotal();
  };

  const calculateTotalShipping = () => {
    const total = cartItems.reduce((sum, item) => {
      const shippingFee = item.product_ShippingFee || 0;
      return sum + shippingFee * item.quantity;
    }, 0);
    return total;
  };

  const subtotal = getSubtotal();
  const shippingTotal = calculateTotalShipping();
  const grandTotal = subtotal + shippingTotal;
  const currency = getCurrency();

  const getFormattedPrice = (price) => {
    return currency === 'USD' ? `$${price.toFixed(2)}` : `${price.toFixed(2)} LBP`;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderItems = cartItems.map(item => ({
      orderItem_ProductId: item.product_Id,
      orderItem_ProductName: item.product_Name,
      orderItem_ProductSKU: item.product_SKU,
      orderItem_Quantity: item.quantity,
      orderItem_UnitPriceUSD: item.product_PriceUSD || null,
      orderItem_UnitPriceLBP: item.product_PriceLBP || null,
      orderItem_TotalPriceUSD: item.product_PriceUSD ? item.product_PriceUSD * item.quantity : null,
      orderItem_TotalPriceLBP: item.product_PriceLBP ? item.product_PriceLBP * item.quantity : null,
    }));

    const orderData = {
      order_CustomerName: formData.customerName,
      order_CustomerPhone: formData.customerPhone,
      order_CustomerEmail: formData.customerEmail || null,
      order_CustomerAddress: formData.customerAddress,
      order_Currency: currency,
      order_SubtotalUSD: currency === 'USD' ? subtotal : null,
      order_SubtotalLBP: currency === 'LBP' ? subtotal : null,
      order_ShippingFeeUSD: currency === 'USD' ? shippingTotal : null,
      order_ShippingFeeLBP: currency === 'LBP' ? shippingTotal : null,
      order_TotalAmountUSD: currency === 'USD' ? grandTotal : null,
      order_TotalAmountLBP: currency === 'LBP' ? grandTotal : null,
      order_Notes: formData.notes || null,
      order_Status: 'Pending',
      order_PaymentMethod: 'COD',
      order_PaymentStatus: 'Unpaid',
      orderItems: orderItems
    };

    try {
      await API.post('/orders', orderData);
      clearCart();
      navigate('/order-success');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <h2>Your Cart is Empty</h2>
          <p>Add some items before checking out.</p>
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="checkout-title">Checkout</h1>
      <div className="checkout-container">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Shipping Information</h3>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>
            <div className="form-group">
              <label>Email (Optional)</label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>
            <div className="form-group">
              <label>Delivery Address *</label>
              <textarea
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Enter your full address"
              />
            </div>
            <div className="form-group">
              <label>Order Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                placeholder="Special instructions for delivery"
              />
            </div>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.product_Id} className="summary-item">
                  <span>{item.product_Name} x{item.quantity}</span>
                  <span>
                    {item.product_PriceUSD 
                      ? `$${(item.product_PriceUSD * item.quantity).toFixed(2)}`
                      : `${(item.product_PriceLBP * item.quantity).toFixed(2)} LBP`}
                  </span>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal ({getCartCount()} items):</span>
                <span>{getFormattedPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>
                  {shippingTotal === 0 
                    ? 'Free' 
                    : getFormattedPrice(shippingTotal)}
                </span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{getFormattedPrice(grandTotal)}</span>
              </div>
            </div>
            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading ? 'Placing Order...' : 'Place Order (Cash on Delivery)'}
            </button>
            <Link to="/cart" className="back-to-cart">
              ← Back to Cart
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;