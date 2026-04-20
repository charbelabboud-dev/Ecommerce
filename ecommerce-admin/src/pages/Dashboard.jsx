import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../contexts/ToastContexts';
import './Dashboard.css';
import LowStockAlert from '../components/LowStockAlert';

function Dashboard({ admin, onLogout }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    pendingOrders: 0,
  });
  
  const errorShown = useRef(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        API.get('/products'),
        API.get('/orders'),
      ]);
      
      const pendingOrders = ordersRes.data.filter(
        (order) => order.order_Status === 'Pending'
      ).length;
      
      setStats({
        products: productsRes.data.length,
        orders: ordersRes.data.length,
        pendingOrders: pendingOrders,
      });
      errorShown.current = false;
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (!errorShown.current) {
        addToast('Failed to load dashboard stats. Backend may be offline.', 'error');
        errorShown.current = true;
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    onLogout();
  };

          const goToReviews = () => {
  navigate('/reviews');
};

  const goToProducts = () => {
    navigate('/products');
  };

  const goToOrders = () => {
    navigate('/orders');
  };

  const goToCategories = () => {
    navigate('/categories');
  };

  const goToSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {admin?.adminUser_StoreName || 'Admin'}!</h1>
        <div className="header-buttons">
          <button onClick={goToSettings} className="settings-button">
            ⚙️ Shop Settings
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-number">{stats.products}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{stats.orders}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p className="stat-number">{stats.pendingOrders}</p>
        </div>
      </div>
      
      <LowStockAlert />
      
      <div className="dashboard-nav">
        <button onClick={goToProducts} className="nav-button">
          📦 Manage Products
        </button>
        <button onClick={goToOrders} className="nav-button">
          📋 View Orders
        </button>
        <button onClick={goToCategories} className="nav-button">
          🏷️ Manage Categories
        </button>
<button onClick={goToReviews} className="nav-button">
  ⭐ Manage Reviews
</button>
      </div>
    </div>
  );
}

export default Dashboard;