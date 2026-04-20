import React from 'react';

function InvoicePrint({ order }) {
  const getTotal = () => {
    if (order.order_Currency === 'USD') {
      return `$${order.order_TotalAmountUSD?.toFixed(2)}`;
    }
    return `${order.order_TotalAmountLBP?.toFixed(2)} LBP`;
  };

  const getSubtotal = () => {
    if (order.order_Currency === 'USD') {
      return `$${order.order_SubtotalUSD?.toFixed(2)}`;
    }
    return `${order.order_SubtotalLBP?.toFixed(2)} LBP`;
  };

  const getShipping = () => {
    if (order.order_Currency === 'USD') {
      return `$${order.order_ShippingFeeUSD?.toFixed(2)}`;
    }
    return `${order.order_ShippingFeeLBP?.toFixed(2)} LBP`;
  };

  return (
    <div className="invoice-print-container" id="invoice-print">
      <div className="invoice">
        {/* Header */}
        <div className="invoice-header">
          <div className="store-info">
            <h2>MyStore</h2>
            <p>123 Main Street, Beirut, Lebanon</p>
            <p>Phone: +961 1 234 567</p>
            <p>Email: info@mystore.com</p>
          </div>
          <div className="invoice-title">
            <h1>INVOICE</h1>
            <p className="invoice-number">Order #{order.order_Number}</p>
            <p>Date: {new Date(order.order_CreatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="customer-section">
          <h3>Bill To:</h3>
          <p><strong>{order.order_CustomerName}</strong></p>
          <p>Phone: {order.order_CustomerPhone}</p>
          {order.order_CustomerEmail && <p>Email: {order.order_CustomerEmail}</p>}
          <p>Address: {order.order_CustomerAddress}</p>
        </div>

        {/* Order Items Table */}
        <table className="invoice-items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems?.map((item) => (
              <tr key={item.orderItem_Id}>
                <td>{item.orderItem_ProductName}</td>
                <td className="text-center">{item.orderItem_Quantity}</td>
                <td className="text-right">
                  {order.order_Currency === 'USD'
                    ? `$${item.orderItem_UnitPriceUSD?.toFixed(2)}`
                    : `${item.orderItem_UnitPriceLBP?.toFixed(2)} LBP`}
                </td>
                <td className="text-right">
                  {order.order_Currency === 'USD'
                    ? `$${item.orderItem_TotalPriceUSD?.toFixed(2)}`
                    : `${item.orderItem_TotalPriceLBP?.toFixed(2)} LBP`}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="subtotal-row">
              <td colSpan="3" className="text-right">Subtotal:</td>
              <td className="text-right">{getSubtotal()}</td>
            </tr>
            <tr className="shipping-row">
              <td colSpan="3" className="text-right">Shipping:</td>
              <td className="text-right">{getShipping()}</td>
            </tr>
            <tr className="total-row">
              <td colSpan="3" className="text-right"><strong>Total:</strong></td>
              <td className="text-right"><strong>{getTotal()}</strong></td>
            </tr>
          </tfoot>
        </table>

        {/* Payment Info */}
        <div className="payment-info">
          <p><strong>Payment Method:</strong> {order.order_PaymentMethod}</p>
          <p><strong>Payment Status:</strong> {order.order_PaymentStatus}</p>
        </div>

        {/* Customer Notes */}
        {order.order_Notes && (
          <div className="notes-section">
            <h4>Customer Notes:</h4>
            <p>{order.order_Notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="invoice-footer">
          <p>Thank you for your business!</p>
          <p>For inquiries, contact us at info@mystore.com</p>
        </div>
      </div>
    </div>
  );
}

export default InvoicePrint;