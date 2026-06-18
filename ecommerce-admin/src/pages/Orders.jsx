import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { downloadCsv } from '../services/api';
import { useToast } from '../contexts/ToastContexts';
import OrderDetailModal from '../components/OrderDetailModal';
import './Orders.css';

function Orders({admin}) {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const errorShown = useRef(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      setOrders(response.data);
      errorShown.current = false;
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!errorShown.current) {
        addToast('Failed to load orders. Backend may be offline.', 'error');
        errorShown.current = true;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, newStatus);
      addToast(`Order status updated to ${newStatus}`, 'success');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      addToast('Failed to update order status', 'error');
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.order_Status === statusFilter);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.order_Number.toLowerCase().includes(term) ||
        order.order_CustomerName.toLowerCase().includes(term) ||
        order.order_CustomerPhone.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const goBack = () => {
    navigate('/');
  };

  const handleExport = async () => {
    try {
      await downloadCsv('/orders/export/csv', `orders-${new Date().toISOString().slice(0, 10)}.csv`);
      addToast('Orders exported', 'success');
    } catch (error) {
      addToast('Export failed', 'error');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Confirmed': return 'status-confirmed';
      case 'Shipped': return 'status-shipped';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const filteredOrders = getFilteredOrders();

  const statusCounts = {
    all: orders.length,
    Pending: orders.filter(o => o.order_Status === 'Pending').length,
    Confirmed: orders.filter(o => o.order_Status === 'Confirmed').length,
    Shipped: orders.filter(o => o.order_Status === 'Shipped').length,
    Delivered: orders.filter(o => o.order_Status === 'Delivered').length,
    Cancelled: orders.filter(o => o.order_Status === 'Cancelled').length,
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div className="header-left">
          <button className="back-button" onClick={goBack}>
            ← Back
          </button>
          <h1>Manage Orders</h1>
        </div>
        <button className="export-button" onClick={handleExport}>Export CSV</button>
      </div>

      <div className="filter-bar">
        <div className="status-filter">
          <button
            className={`filter-status-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({statusCounts.all})
          </button>
          <button
            className={`filter-status-btn ${statusFilter === 'Pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Pending')}
          >
            Pending ({statusCounts.Pending})
          </button>
          <button
            className={`filter-status-btn ${statusFilter === 'Confirmed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Confirmed')}
          >
            Confirmed ({statusCounts.Confirmed})
          </button>
          <button
            className={`filter-status-btn ${statusFilter === 'Shipped' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Shipped')}
          >
            Shipped ({statusCounts.Shipped})
          </button>
          <button
            className={`filter-status-btn ${statusFilter === 'Delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Delivered')}
          >
            Delivered ({statusCounts.Delivered})
          </button>
          <button
            className={`filter-status-btn ${statusFilter === 'Cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Cancelled')}
          >
            Cancelled ({statusCounts.Cancelled})
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.order_Id}>
                    <td data-label="Order #">{order.order_Number}</td>
                    <td data-label="Customer">{order.order_CustomerName}</td>
                    <td data-label="Phone">{order.order_CustomerPhone}</td>
                    <td data-label="Date">{new Date(order.order_CreatedAt).toLocaleDateString()}</td>
                    <td data-label="Total">
                      {order.order_Currency === 'USD' 
                        ? `$${order.order_TotalAmountUSD?.toFixed(2)}`
                        : `${order.order_TotalAmountLBP?.toFixed(2)} LBP`}
                    </td>
                    <td data-label="Status">
                      <span className={`status-badge ${getStatusClass(order.order_Status)}`}>
                        {order.order_Status}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <button
                        className="view-details-btn"
                        onClick={() => handleViewDetails(order)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <OrderDetailModal
          order={selectedOrder}
          admin={admin}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

export default Orders;