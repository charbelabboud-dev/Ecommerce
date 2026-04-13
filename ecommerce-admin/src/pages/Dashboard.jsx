import React, { useEffect, useState } from 'react';
import API from '../services/api';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

function Dashboard({ admin, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    pendingOrders: 0,
  });

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
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    onLogout();
  };

  const goToProducts = () => {
      navigate('/products');
  };

  const goToOrders = () => {
    navigate('/orders');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {admin?.adminUser_StoreName || 'Admin'}!</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
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
      
      <div className="dashboard-nav">
        <button onClick={goToProducts} className="nav-button">
          📦 Manage Products
        </button>
        <button onClick={goToOrders} className="nav-button">
          📋 View Orders
        </button>
      </div>
    </div>
  );
}

export default Dashboard;