import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContexts';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import AdminReviews from './pages/AdminReviews';
import Coupons from './pages/Coupons';
import './App.css';
import { ConfirmProvider } from './contexts/ConfirmContext';


import ApiStatusGate from './components/ApiStatusGate';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);

  // Check if user was previously logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedAdmin = localStorage.getItem('admin');
    
    if (token && savedAdmin) {
      setIsAuthenticated(true);
      setAdmin(JSON.parse(savedAdmin));
    }
  }, []);

  const handleLogin = (adminData) => {
    setIsAuthenticated(true);
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setIsAuthenticated(false);
    setAdmin(null);
  };

  // Protected Route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <ToastProvider>
      <ConfirmProvider>
      <ApiStatusGate>
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard admin={admin} onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          
          <Route path="/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders admin ={admin} />
            </ProtectedRoute>
          } />

<Route path="/reviews" element={
  <ProtectedRoute>
    <AdminReviews />
  </ProtectedRoute>
} />
          <Route path="*" element={
            isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />
          } />
          <Route path="/categories" element={
  <ProtectedRoute>
    <Categories />
  </ProtectedRoute>
} />


<Route path="/settings" element={
  <ProtectedRoute>
    <Settings />
  </ProtectedRoute>
} />
<Route path="/coupons" element={
  <ProtectedRoute>
    <Coupons />
  </ProtectedRoute>
} />
        </Routes>
      </Router>
      </ApiStatusGate>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;