import React, { useEffect, useState } from 'react';
import API from '../services/api';
import './SalesChart.css';

function SalesChart() {
  const [range, setRange] = useState('30');
  const [groupBy, setGroupBy] = useState('day');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [range, groupBy]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const days = parseInt(range, 10);
      const from = new Date();
      from.setDate(from.getDate() - days);
      const response = await API.get('/orders/sales-stats', {
        params: {
          from: from.toISOString(),
          to: new Date().toISOString(),
          groupBy
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load sales stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const dataPoints = stats?.dataPoints || [];
  const maxUSD = Math.max(...dataPoints.map(d => d.salesUSD || 0), 1);

  return (
    <div className="sales-chart-section">
      <div className="sales-chart-header">
        <h3>Sales Trends</h3>
        <div className="sales-chart-controls">
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="sales-chart-loading">Loading chart...</p>
      ) : dataPoints.length === 0 ? (
        <p className="sales-chart-empty">No sales data for this period.</p>
      ) : (
        <>
          <div className="sales-chart-summary">
            <span>{stats.totalOrders} orders</span>
            <span>${(stats.totalSalesUSD || 0).toFixed(2)} USD</span>
            <span>{(stats.totalSalesLBP || 0).toLocaleString()} LBP</span>
          </div>
          <div className="sales-chart-bars">
            {dataPoints.map((point) => (
              <div key={point.label} className="sales-bar-col" title={`${point.label}: $${point.salesUSD?.toFixed(2)} (${point.orderCount} orders)`}>
                <div
                  className="sales-bar"
                  style={{ height: `${Math.max(4, (point.salesUSD / maxUSD) * 100)}%` }}
                />
                <span className="sales-bar-label">{groupBy === 'week' ? point.label : point.label.slice(5)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SalesChart;
