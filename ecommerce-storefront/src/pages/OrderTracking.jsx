import React, { useState } from 'react';
import API from '../services/api';

function OrderTracking() {
  const [searchMethod, setSearchMethod] = useState('phone');
  const [searchValue, setSearchValue] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setLoading(true);
    setSearched(true);
    setError('');
    
    // Reset filters when searching
    setStatusFilter('all');
    setDateFilter('all');

    try {
      let url = '/orders/lookup?';
      if (searchMethod === 'phone') {
        const trimmedPhone = searchValue.trim();
        url += `phone=${encodeURIComponent(trimmedPhone)}`;
      } else {
        const trimmedEmail = searchValue.trim().toLowerCase();
        url += `email=${encodeURIComponent(trimmedEmail)}`;
      }
      
      const response = await API.get(url);
      setOrders(response.data);
      
      if (response.data.length === 0) {
        setError(`No orders found for this ${searchMethod === 'phone' ? 'phone number' : 'email'}.`);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter by status
  const filterByStatus = (ordersList) => {
    if (statusFilter === 'all') return ordersList;
    return ordersList.filter(order => order.order_Status === statusFilter);
  };

  // Filter by date
  const filterByDate = (ordersList) => {
    if (dateFilter === 'all') return ordersList;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch(dateFilter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return ordersList;
    }
    
    return ordersList.filter(order => new Date(order.order_CreatedAt) >= filterDate);
  };

  // Apply both filters
  const getFilteredOrders = () => {
    let filtered = [...orders];
    filtered = filterByStatus(filtered);
    filtered = filterByDate(filtered);
    return filtered;
  };

  const filteredOrders = getFilteredOrders();

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

  const getTotal = (order) => {
    if (order.order_Currency === 'USD') {
      return `$${order.order_TotalAmountUSD?.toFixed(2)}`;
    }
    return `${order.order_TotalAmountLBP?.toFixed(2)} LBP`;
  };

  // Count orders by status
  const getStatusCount = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.order_Status === status).length;
  };

  return (
    <div className="container">
      <div className="tracking-container">
        <h1 className="tracking-title">Track Your Orders</h1>
        <p className="tracking-subtitle">Enter your phone number or email to view your order history</p>

        <form onSubmit={handleSearch} className="tracking-form">
          <div className="tracking-method">
            <label>
              <input
                type="radio"
                value="phone"
                checked={searchMethod === 'phone'}
                onChange={(e) => setSearchMethod(e.target.value)}
              />
              Search by Phone Number
            </label>
            <label>
              <input
                type="radio"
                value="email"
                checked={searchMethod === 'email'}
                onChange={(e) => setSearchMethod(e.target.value)}
              />
              Search by Email
            </label>
          </div>

          <div className="tracking-input-group">
            <input
              type={searchMethod === 'phone' ? 'tel' : 'email'}
              placeholder={searchMethod === 'phone' ? 'Enter your phone number' : 'Enter your email address'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Find My Orders'}
            </button>
          </div>
        </form>

        {searched && !loading && (
          <div className="tracking-results">
            {error ? (
              <div className="no-orders">
                <p>{error}</p>
                <p>Please check your information and try again.</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="no-orders">
                <p>No orders found for this {searchMethod === 'phone' ? 'phone number' : 'email'}.</p>
                <p>Please check your information and try again.</p>
              </div>
            ) : (
              <>
                <div className="results-header">
                  <h2>Found {orders.length} order(s)</h2>
                </div>

                {/* Filter Bar */}
                <div className="order-filters">
                  <div className="filter-group">
                    <label>Status:</label>
                    <div className="status-filter-buttons">
                      <button
                        className={`filter-status-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                      >
                        All ({getStatusCount('all')})
                      </button>
                      <button
                        className={`filter-status-btn ${statusFilter === 'Pending' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Pending')}
                      >
                        Pending ({getStatusCount('Pending')})
                      </button>
                      <button
                        className={`filter-status-btn ${statusFilter === 'Confirmed' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Confirmed')}
                      >
                        Confirmed ({getStatusCount('Confirmed')})
                      </button>
                      <button
                        className={`filter-status-btn ${statusFilter === 'Shipped' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Shipped')}
                      >
                        Shipped ({getStatusCount('Shipped')})
                      </button>
                      <button
                        className={`filter-status-btn ${statusFilter === 'Delivered' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Delivered')}
                      >
                        Delivered ({getStatusCount('Delivered')})
                      </button>
                      <button
                        className={`filter-status-btn ${statusFilter === 'Cancelled' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Cancelled')}
                      >
                        Cancelled ({getStatusCount('Cancelled')})
                      </button>
                    </div>
                  </div>

                  <div className="filter-group">
                    <label>Date:</label>
                    <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="date-filter-select">
                      <option value="all">All Time</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                      <option value="year">Last Year</option>
                    </select>
                  </div>
                </div>

                {/* Filter Results Summary */}
                {filteredOrders.length !== orders.length && (
                  <div className="filter-summary">
                    Showing {filteredOrders.length} of {orders.length} orders
                    <button className="clear-filters-btn" onClick={() => {
                      setStatusFilter('all');
                      setDateFilter('all');
                    }}>
                      Clear Filters
                    </button>
                  </div>
                )}

                {/* Orders List */}
                <div className="orders-list">
                  {filteredOrders.length === 0 ? (
                    <div className="no-filtered-orders">
                      <p>No orders match the selected filters.</p>
                      <button className="clear-filters-btn" onClick={() => {
                        setStatusFilter('all');
                        setDateFilter('all');
                      }}>
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    filteredOrders.map(order => (
                      <div key={order.order_Id} className="order-card">
                        <div className="order-header">
                          <span className="order-number">Order #{order.order_Number}</span>
                          <span className={`order-status ${getStatusClass(order.order_Status)}`}>
                            {order.order_Status}
                          </span>
                        </div>
                        <div className="order-details">
                          <div className="order-info">
                            <p><strong>Date:</strong> {new Date(order.order_CreatedAt).toLocaleDateString()}</p>
                            <p><strong>Total:</strong> {getTotal(order)}</p>
                            <p><strong>Payment:</strong> {order.order_PaymentMethod}</p>
                          </div>
                          <div className="order-items">
                            <strong>Items:</strong>
                            <ul>
                              {order.orderItems?.map(item => (
                                <li key={item.orderItem_Id}>
                                  {item.orderItem_ProductName} x{item.orderItem_Quantity}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="order-address">
                            <strong>Delivery Address:</strong>
                            <p>{order.order_CustomerAddress}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderTracking;