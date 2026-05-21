import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/navbar.jsx';
import Home from './pages/Home';
import Products from './pages/Products';
import './App.css';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/orderSuccess.jsx';
import ProductDetail from './pages/ProductDetails.jsx';
import OrderTracking from './pages/OrderTracking';
import Wishlist from './pages/Wishlist';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import CustomerLogin from './pages/CustomerLogin';
import OrderHistory from './pages/OrderHistory';
import { ToastProvider } from './components/ToastContext.jsx';



function App() {
  return (
    <Router>
      <ToastProvider>
        <CartProvider>
          <Navbar />
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/track-order" element={<OrderTracking />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/orders" element={<OrderHistory />} />
        </Routes>
        </CartProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;