import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContexts';
import './OrderDetailModal.css';

function OrderDetailModal({ order, admin, onClose, onStatusUpdate }) {
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

//   const handlePrintinvoice = () => {
//   const printContent = document.getElementById('invoice-print');
//   const originalTitle = document.title;
  
//   // Store original content
//   const originalContent = document.body.innerHTML;
  
//   // Replace body with invoice content
//   document.body.innerHTML = printContent.innerHTML;
  
//   // Print
//   window.print();
  
//   // Restore original content
//   document.body.innerHTML = originalContent;
//   document.title = originalTitle;
  
//   // Reattach React root (important for React to work after restore)
//   window.location.reload();
// };
const handlePrintInvoice = () => {
  const printWindow = window.open('', '_blank');
  
  // Get store info from admin prop
  const storeName = admin?.adminUser_StoreName || 'MyStore';
  const storeAddress = admin?.adminUser_StoreAddress || '123 Main Street, Beirut, Lebanon';
  const storePhone = admin?.adminUser_StorePhone || '+961 1 234 567';
  const storeEmail = admin?.adminUser_Email || 'info@mystore.com';
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - Order ${order.order_Number}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .invoice {
            max-width: 800px;
            margin: 0 auto;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
          }
          .store-info h2 {
            margin: 0 0 5px 0;
            color: #1e3a5f;
          }
          .store-info p {
            margin: 3px 0;
            font-size: 12px;
            color: #666;
          }
          .invoice-title h1 {
            margin: 0;
            color: #1e3a5f;
          }
          .invoice-number {
            font-weight: bold;
            margin: 5px 0;
          }
          .customer-section {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 8px;
          }
          .customer-section h3 {
            margin: 0 0 10px 0;
            color: #1e3a5f;
          }
          .customer-section p {
            margin: 5px 0;
          }
          .invoice-items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .invoice-items th,
          .invoice-items td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }
          .invoice-items th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
          }
          .total-row {
            font-size: 18px;
            border-top: 2px solid #333;
          }
          .payment-info {
            margin: 20px 0;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
          }
          .notes-section {
            margin: 20px 0;
            padding: 10px;
            background-color: #fff3e0;
            border-radius: 5px;
          }
          .invoice-footer {
            margin-top: 40px;
            padding-top: 20px;
            text-align: center;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="invoice-header">
            <div class="store-info">
              <h2>${storeName}</h2>
              <p>${storeAddress}</p>
              <p>Phone: ${storePhone}</p>
              <p>Email: ${storeEmail}</p>
            </div>
            <div class="invoice-title">
              <h1>INVOICE</h1>
              <p class="invoice-number">Order #${order.order_Number}</p>
              <p>Date: ${new Date(order.order_CreatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div class="customer-section">
            <h3>Bill To:</h3>
            <p><strong>${order.order_CustomerName}</strong></p>
            <p>Phone: ${order.order_CustomerPhone}</p>
            ${order.order_CustomerEmail ? `<p>Email: ${order.order_CustomerEmail}</p>` : ''}
            <p>Address: ${order.order_CustomerAddress}</p>
          </div>

          <table class="invoice-items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems?.map(item => `
                <tr>
                  <td>${item.orderItem_ProductName}</td>
                  <td class="text-center">${item.orderItem_Quantity}</td>
                  <td class="text-right">${order.order_Currency === 'USD' 
                    ? `$${item.orderItem_UnitPriceUSD?.toFixed(2)}`
                    : `${item.orderItem_UnitPriceLBP?.toFixed(2)} LBP`}</td>
                  <td class="text-right">${order.order_Currency === 'USD' 
                    ? `$${item.orderItem_TotalPriceUSD?.toFixed(2)}`
                    : `${item.orderItem_TotalPriceLBP?.toFixed(2)} LBP`}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="subtotal-row">
                <td colspan="3" class="text-right">Subtotal:</td>
                <td class="text-right">${order.order_Currency === 'USD' 
                  ? `$${order.order_SubtotalUSD?.toFixed(2)}`
                  : `${order.order_SubtotalLBP?.toFixed(2)} LBP`}</td>
              </tr>
              <tr class="shipping-row">
                <td colspan="3" class="text-right">Shipping:</td>
                <td class="text-right">${order.order_Currency === 'USD' 
                  ? `$${order.order_ShippingFeeUSD?.toFixed(2)}`
                  : `${order.order_ShippingFeeLBP?.toFixed(2)} LBP`}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" class="text-right"><strong>Total:</strong></td>
                <td class="text-right"><strong>${order.order_Currency === 'USD' 
                  ? `$${order.order_TotalAmountUSD?.toFixed(2)}`
                  : `${order.order_TotalAmountLBP?.toFixed(2)} LBP`}</strong></td>
              </tr>
            </tfoot>
          </table>

          <div class="payment-info">
            <p><strong>Payment Method:</strong> ${order.order_PaymentMethod}</p>
            <p><strong>Payment Status:</strong> ${order.order_PaymentStatus}</p>
          </div>

          ${order.order_Notes ? `
            <div class="notes-section">
              <h4>Customer Notes:</h4>
              <p>${order.order_Notes}</p>
            </div>
          ` : ''}

          <div class="invoice-footer">
            <p>Thank you for your business!</p>
            <p>For inquiries, contact us at ${admin?.adminUser_Email || 'info@mystore.com'}</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
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
  {order.order_Status !== 'Pending' && (
    <button
      className="print-invoice-btn"
      onClick={handlePrintInvoice}
    >
      🖨️ Print Invoice
    </button>
  )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;