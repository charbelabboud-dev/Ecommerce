import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContexts';
import './OrderDetailModal.css';

function OrderDetailModal({ order, onClose, onStatusUpdate }) {
  const { addToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState(order?.order_Status || 'Pending');
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const handleStatusChange = async () => {
    if (selectedStatus === order.order_Status) {
      addToast('No change in status', 'info');
      return;
    }

    setUpdating(true);
    await onStatusUpdate(order.order_Id, selectedStatus);
    setUpdating(false);
    onClose();
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>Order Details - {order.order_Number}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Order Information */}
        <div className="order-info">
          <div className="info-row">
            <span className="info-label">Customer Name:</span>
            <span className="info-value">{order.order_CustomerName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Phone Number:</span>
            <span className="info-value">{order.order_CustomerPhone}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{order.order_CustomerEmail || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Delivery Address:</span>
            <span className="info-value">{order.order_CustomerAddress}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Order Date:</span>
            <span className="info-value">{new Date(order.order_CreatedAt).toLocaleString()}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Payment Method:</span>
            <span className="info-value">{order.order_PaymentMethod}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Payment Status:</span>
            <span className="info-value">{order.order_PaymentStatus}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Order Status:</span>
            <span className="info-value">
              <span className={`status-badge status-badge-large ${getStatusClass(order.order_Status)}`}>
                {order.order_Status}
              </span>
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="items-section">
          <h3>Order Items</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems && order.orderItems.length > 0 ? (
                order.orderItems.map((item) => (
                  <tr key={item.orderItem_Id}>
                    <td>{item.orderItem_ProductName}</td>
                    <td>{item.orderItem_ProductSKU || '-'}</td>
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
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">No items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="totals-section">
          <div className="total-row">
            <span className="total-label">Subtotal:</span>
            <span className="total-value">
              {order.order_Currency === 'USD'
                ? `$${order.order_SubtotalUSD?.toFixed(2)}`
                : `${order.order_SubtotalLBP?.toFixed(2)} LBP`}
            </span>
          </div>
          <div className="total-row">
            <span className="total-label">Shipping Fee:</span>
            <span className="total-value">
              {order.order_Currency === 'USD'
                ? `$${order.order_ShippingFeeUSD?.toFixed(2)}`
                : `${order.order_ShippingFeeLBP?.toFixed(2)} LBP`}
            </span>
          </div>
          <div className="total-row grand-total">
            <span className="total-label">Grand Total:</span>
            <span className="total-value">
              {order.order_Currency === 'USD'
                ? `$${order.order_TotalAmountUSD?.toFixed(2)}`
                : `${order.order_TotalAmountLBP?.toFixed(2)} LBP`}
            </span>
          </div>
        </div>

        {/* Customer Notes */}
        {order.order_Notes && (
          <div className="notes-section">
            <h4>Customer Notes:</h4>
            <p>{order.order_Notes}</p>
          </div>
        )}

        {/* Admin Notes */}
        {order.order_AdminNotes && (
          <div className="notes-section">
            <h4>Admin Notes:</h4>
            <p>{order.order_AdminNotes}</p>
          </div>
        )}

        {/* Update Status Section */}
        <div className="status-update-section">
          <label>Update Status:</label>
          <select
            className="status-select-modal"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button
            className="update-status-btn"
            onClick={handleStatusChange}
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;