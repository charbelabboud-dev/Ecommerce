import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../contexts/ToastContexts';

function LowStockAlert() {
  const navigate = useNavigate();
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchLowStockProducts();
    const interval = setInterval(fetchLowStockProducts, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const response = await API.get('/products/low-stock');
      setLowStockProducts(response.data);
      
      if (response.data.length > 0 && response.data.length !== lowStockProducts.length) {
        addToast(`${response.data.length} product(s) are low on stock!`, 'warning');
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToProduct = (productId) => {
    navigate('/products');
    // You could also scroll to or highlight the specific product
  };

  if (loading) return null;

  if (lowStockProducts.length === 0) return null;

  return (
    <div className="low-stock-card">
      <div className="low-stock-header">
        <div className="low-stock-icon">⚠️</div>
        <div className="low-stock-info">
          <h4>Low Stock Alert</h4>
          <p>{lowStockProducts.length} product(s) need attention</p>
        </div>
      </div>
      <div className="low-stock-items">
        {lowStockProducts.slice(0, 3).map(product => (
          <div key={product.product_Id} className="low-stock-item" onClick={() => goToProduct(product.product_Id)}>
            <span className="product-name">{product.product_Name}</span>
            <span className="stock-badge danger">Only {product.product_Stock} left</span>
          </div>
        ))}
        {lowStockProducts.length > 3 && (
          <div className="low-stock-more">
            +{lowStockProducts.length - 3} more products
          </div>
        )}
      </div>
    </div>
  );
}

export default LowStockAlert;