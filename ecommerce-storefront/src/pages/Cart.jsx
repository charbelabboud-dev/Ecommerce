import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();

  const getPrice = (item) => {
    if (item.product_PriceUSD) {
      return `$${item.product_PriceUSD.toFixed(2)}`;
    }
    if (item.product_PriceLBP) {
      return `${item.product_PriceLBP.toFixed(2)} LBP`;
    }
    return 'N/A';
  };

  const getItemTotal = (item) => {
    const price = item.product_PriceUSD || item.product_PriceLBP || 0;
    return price * item.quantity;
  };

  const formatTotal = (total) => {
    // Determine currency from first item
    const firstItem = cartItems[0];
    if (firstItem?.product_PriceUSD) {
      return `$${total.toFixed(2)}`;
    }
    return `${total.toFixed(2)} LBP`;
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added any items yet.</p>
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="cart-title">Shopping Cart</h1>
      <div className="cart-container">
        <div className="cart-items">
          <div className="cart-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>
          {cartItems.map(item => (
            <div key={item.product_Id} className="cart-item">
              <div className="cart-item-product">
                <img 
                  src={item.productImages?.[0]?.productImage_ImageUrl 
                    ? `http://localhost:5147${item.productImages[0].productImage_ImageUrl}` 
                    : null}
                  alt={item.product_Name}
                  className="cart-item-image"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="cart-item-info">
                  <Link to={`/product/${item.product_Id}`} className="cart-item-name">
                    {item.product_Name}
                  </Link>
                </div>
              </div>
              <div className="cart-item-price">{getPrice(item)}</div>
              <div className="cart-item-quantity">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product_Id, parseInt(e.target.value))}
                  className="quantity-input"
                />
              </div>
              <div className="cart-item-total">{formatTotal(getItemTotal(item))}</div>
              <div className="cart-item-remove">
                <button onClick={() => removeFromCart(item.product_Id)} className="remove-btn">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({getCartCount()} items):</span>
            <span>{formatTotal(getCartTotal())}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>{formatTotal(getCartTotal())}</span>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
          <Link to="/products" className="continue-shopping-link">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;