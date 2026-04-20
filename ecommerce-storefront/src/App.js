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




function App() {
  return (
    <Router>
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
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;