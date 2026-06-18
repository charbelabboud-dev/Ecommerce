import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../contexts/ToastContexts';
import './Dashboard.css';
import LowStockAlert from '../components/LowStockAlert';
import { clearAdminSession } from '../services/authStore';
import SalesChart from '../components/SalesChart';

function Dashboard({ admin, onLogout }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    pendingReviews: 0,
    totalSalesUSD: 0,
    totalSalesLBP: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  const errorShown = useRef(false);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, pendingReviewsRes, productsRes] = await Promise.all([
        API.get('/orders'),
        API.get('/reviews/pending'),
        API.get('/products'),
      ]);

      const orders = ordersRes.data;
      const completedOrders = orders.filter((order) => order.order_Status !== 'Cancelled');
      const pendingOrders = orders.filter((order) => order.order_Status === 'Pending').length;

      const totalSalesUSD = completedOrders.reduce(
        (sum, order) => sum + (order.order_TotalAmountUSD || 0),
        0
      );
      const totalSalesLBP = completedOrders.reduce(
        (sum, order) => sum + (order.order_TotalAmountLBP || 0),
        0
      );

      const products = productsRes.data;
      const lowStockCount = products.filter((p) => {
        const threshold = p.product_LowStockThreshold > 0 ? p.product_LowStockThreshold : 5;
        return p.product_Stock > 0 && p.product_Stock <= threshold;
      }).length;
      const outOfStockCount = products.filter((p) => p.product_Stock === 0).length;

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        pendingReviews: pendingReviewsRes.data.length,
        totalSalesUSD,
        totalSalesLBP,
        lowStockCount,
        outOfStockCount,
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
    clearAdminSession();
    onLogout();
  };

  const formatUSD = (amount) => `$${amount.toFixed(2)}`;
  const formatLBP = (amount) => `${amount.toLocaleString()} LBP`;

  const NavButton = ({ onClick, icon, label, badgeCount }) => (
    <div className="nav-button-wrapper">
      <button onClick={onClick} className="nav-button">
        {icon} {label}
      </button>
      {badgeCount > 0 && (
        <span className="nav-badge" aria-label={`${badgeCount} notifications`}>
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {admin?.adminUser_StoreName || 'Admin'}!</h1>
        <div className="header-buttons">
          <button onClick={() => navigate('/settings')} className="settings-button">
            ⚙️ Shop Settings
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card--sales">
          <h3>Total Sales (USD)</h3>
          <p className="stat-number stat-number--currency">{formatUSD(stats.totalSalesUSD)}</p>
          <span className="stat-subtext">Excludes cancelled orders</span>
        </div>
        <div className="stat-card stat-card--sales">
          <h3>Total Sales (LBP)</h3>
          <p className="stat-number stat-number--currency">{formatLBP(stats.totalSalesLBP)}</p>
          <span className="stat-subtext">Excludes cancelled orders</span>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p className="stat-number stat-number--warning">{stats.pendingOrders}</p>
        </div>
      </div>

      <SalesChart />

      <div className="dashboard-alerts">
        <LowStockAlert />

        {stats.pendingOrders > 0 && (
          <div className="alert-card alert-card--orders" onClick={() => navigate('/orders')}>
            <div className="alert-card-header">
              <div className="alert-card-icon">📋</div>
              <div className="alert-card-info">
                <h4>Pending Orders</h4>
                <p>You have {stats.pendingOrders} order{stats.pendingOrders !== 1 ? 's' : ''} waiting to be processed</p>
              </div>
              <span className="alert-card-badge">{stats.pendingOrders}</span>
            </div>
          </div>
        )}

        {stats.pendingReviews > 0 && (
          <div className="alert-card alert-card--reviews" onClick={() => navigate('/reviews')}>
            <div className="alert-card-header">
              <div className="alert-card-icon">⭐</div>
              <div className="alert-card-info">
                <h4>Pending Reviews</h4>
                <p>You have {stats.pendingReviews} review{stats.pendingReviews !== 1 ? 's' : ''} awaiting approval</p>
              </div>
              <span className="alert-card-badge">{stats.pendingReviews}</span>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-nav">
        <NavButton
          onClick={() => navigate('/products')}
          icon="📦"
          label="Manage Products"
          badgeCount={stats.lowStockCount + stats.outOfStockCount}
        />
        <NavButton
          onClick={() => navigate('/orders')}
          icon="📋"
          label="View Orders"
          badgeCount={stats.pendingOrders}
        />
        <NavButton
          onClick={() => navigate('/categories')}
          icon="🏷️"
          label="Manage Categories"
        />
        <NavButton
          onClick={() => navigate('/coupons')}
          icon="🎟️"
          label="Promo Codes"
        />
        <NavButton
          onClick={() => navigate('/reviews')}
          icon="⭐"
          label="Manage Reviews"
          badgeCount={stats.pendingReviews}
        />
      </div>
    </div>
  );
}

export default Dashboard;
