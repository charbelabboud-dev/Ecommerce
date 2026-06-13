import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCustomerOrders } from '../services/OrderApi';
import { useToast } from '../contexts/ToastContext';
import './OrderHistory.css';

function OrderHistory() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      setLoading(false);
      addToast('Please login to view your orders', 'error');
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [navigate, addToast]);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getCustomerOrders();
    setOrders(data);
    setLoading(false);
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

  const getTotal = (order) => {
    if (order.order_Currency === 'USD') {
      return `$${order.order_TotalAmountUSD?.toFixed(2)}`;
    }
    return `${order.order_TotalAmountLBP?.toFixed(2)} LBP`;
  };

  if (loading) {
    return <div className="container loading">Loading your orders...</div>;
  }

  return (
    <div className="container">
      <div className="order-history-container">
        <h1>My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet.</p>
            <Link to="/products" className="order-history-cta">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.order_Id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-number">Order #{order.order_Number}</span>
                    <span className="order-date">
                      {new Date(order.order_CreatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`order-status ${getStatusClass(order.order_Status)}`}>
                    {order.order_Status}
                  </span>
                </div>
                
                <div className="order-items-preview">
                  {order.orderItems?.slice(0, 2).map(item => (
                    <div key={item.orderItem_Id} className="order-item-preview">
                      <span>{item.orderItem_ProductName}</span>
                      <span>x{item.orderItem_Quantity}</span>
                    </div>
                  ))}
                  {order.orderItems?.length > 2 && (
                    <div className="order-more">+{order.orderItems.length - 2} more items</div>
                  )}
                </div>
                
                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total:</strong> {getTotal(order)}
                  </div>
                  <button 
                    className="view-details-btn"
                    onClick={() => setSelectedOrder(selectedOrder === order ? null : order)}
                  >
                    {selectedOrder === order ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
                
                {selectedOrder === order && (
                  <div className="order-details-modal">
                    <h4>Order Items</h4>
                    <table className="order-items-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderItems?.map(item => (
                          <tr key={item.orderItem_Id}>
                            <td>{item.orderItem_ProductName}</td>
                            <td>{item.orderItem_Quantity}</td>
                            <td>
                              {order.order_Currency === 'USD'
                                ? `$${item.orderItem_UnitPriceUSD?.toFixed(2)}`
                                : `${item.orderItem_UnitPriceLBP?.toFixed(2)} LBP`}
                            </td>
                            <td>
                              {order.order_Currency === 'USD'
                                ? `$${item.orderItem_TotalPriceUSD?.toFixed(2)}`
                                : `${item.orderItem_TotalPriceLBP?.toFixed(2)} LBP`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="subtotal-row">
                          <td colSpan="3">Subtotal:</td>
                          <td>
                            {order.order_Currency === 'USD'
                              ? `$${order.order_SubtotalUSD?.toFixed(2)}`
                              : `${order.order_SubtotalLBP?.toFixed(2)} LBP`}
                          </td>
                        </tr>
                        <tr className="shipping-row">
                          <td colSpan="3">Shipping:</td>
                          <td>
                            {order.order_Currency === 'USD'
                              ? `$${order.order_ShippingFeeUSD?.toFixed(2)}`
                              : `${order.order_ShippingFeeLBP?.toFixed(2)} LBP`}
                          </td>
                        </tr>
                        <tr className="total-row">
                          <td colSpan="3"><strong>Total:</strong></td>
                          <td><strong>{getTotal(order)}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                    
                    <div className="order-address">
                      <h4>Delivery Address</h4>
                      <p>{order.order_CustomerAddress}</p>
                    </div>
                    
                    {order.order_Notes && (
                      <div className="order-notes">
                        <h4>Notes</h4>
                        <p>{order.order_Notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;