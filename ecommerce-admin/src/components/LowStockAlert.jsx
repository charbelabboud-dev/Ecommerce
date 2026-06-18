import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../contexts/ToastContexts';

function LowStockAlert() {
  const navigate = useNavigate();
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchStockAlerts();
    const interval = setInterval(fetchStockAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStockAlerts = async () => {
    try {
      const response = await API.get('/products');
      const products = response.data;
      
      // Low stock: 1 to 5 items
      const lowStock = products.filter(p => {
        const threshold = p.product_LowStockThreshold > 0 ? p.product_LowStockThreshold : 5;
        return p.product_Stock > 0 && p.product_Stock <= threshold;
      });
      // Out of stock: 0 items
      const outOfStock = products.filter(p => p.product_Stock === 0);
      
      setLowStockProducts(lowStock);
      setOutOfStockProducts(outOfStock);
      
      // Show toast notifications
      if (outOfStock.length > 0) {
        addToast(`${outOfStock.length} product(s) are OUT OF STOCK!`, 'error');
      } else if (lowStock.length > 0) {
        addToast(`${lowStock.length} product(s) are low on stock!`, 'warning');
      }
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToProduct = (productId) => {
    navigate('/products');
  };

  if (loading) return null;

  const hasAlerts = outOfStockProducts.length > 0 || lowStockProducts.length > 0;
  if (!hasAlerts) return null;

  return (
    <div className="stock-alerts-container">
      {/* Out of Stock Section - RED */}
      {outOfStockProducts.length > 0 && (
        <div className="stock-card out-of-stock-card">
          <div className="stock-header out-of-stock-header">
            <div className="stock-icon">❌</div>
            <div className="stock-info">
              <h4>Out of Stock!</h4>
              <p>{outOfStockProducts.length} product(s) need immediate attention</p>
            </div>
          </div>
          <div className="stock-items">
            {outOfStockProducts.slice(0, 3).map(product => (
              <div key={product.product_Id} className="stock-item" onClick={() => goToProduct(product.product_Id)}>
                <span className="product-name">{product.product_Name}</span>
                <span className="stock-badge out-of-stock-badge">0 left</span>
              </div>
            ))}
            {outOfStockProducts.length > 3 && (
              <div className="stock-more">
                +{outOfStockProducts.length - 3} more products out of stock
              </div>
            )}
          </div>
        </div>
      )}

      {/* Low Stock Section - ORANGE */}
      {lowStockProducts.length > 0 && (
        <div className="stock-card low-stock-card">
          <div className="stock-header low-stock-header">
            <div className="stock-icon">⚠️</div>
            <div className="stock-info">
              <h4>Low Stock Alert</h4>
              <p>{lowStockProducts.length} product(s) need attention</p>
            </div>
          </div>
          <div className="stock-items">
            {lowStockProducts.slice(0, 3).map(product => (
              <div key={product.product_Id} className="stock-item" onClick={() => goToProduct(product.product_Id)}>
                <span className="product-name">{product.product_Name}</span>
                <span className="stock-badge low-stock-badge">Only {product.product_Stock} left</span>
              </div>
            ))}
            {lowStockProducts.length > 3 && (
              <div className="stock-more">
                +{lowStockProducts.length - 3} more products low on stock
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LowStockAlert;