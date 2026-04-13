import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../contexts/ToastContexts';
import OrderDetailModal from '../components/OrderDetailModal';
import './Orders.css';

function Orders() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // State variables
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Function to fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Function to update order status
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, newStatus);
      addToast(`Order status updated to ${newStatus}`, 'success');
      fetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Error updating order status:', error);
      addToast('Failed to update order status', 'error');
    }
  };

  // Function to filter and search orders
  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.order_Status === statusFilter);
    }

    // Filter by search term
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

  // Function to open order detail modal
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Function to close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Function to go back to dashboard
  const goBack = () => {
    navigate('/');
  };

  // Helper to get status badge class
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

  // Get filtered orders
  const filteredOrders = getFilteredOrders();

  // Status counts for filter buttons
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
      </div>

      {/* Filter Bar */}
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
            placeholder="🔍 Search by order #, customer name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>
      </div>

      {/* Orders Table */}
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
                    <td>{order.order_Number}</td>
                    <td>{order.order_CustomerName}</td>
                    <td>{order.order_CustomerPhone}</td>
                    <td>{new Date(order.order_CreatedAt).toLocaleDateString()}</td>
                    <td>
                      {order.order_Currency === 'USD' 
                        ? `$${order.order_TotalAmountUSD?.toFixed(2)}`
                        : `${order.order_TotalAmountLBP?.toFixed(2)} LBP`}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.order_Status)}`}>
                        {order.order_Status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={order.order_Status}
                        onChange={(e) => handleStatusUpdate(order.order_Id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
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

      {/* Order Detail Modal */}
      {showModal && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

export default Orders;