
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';
import { getUnitPrice } from '../utils/pricing';
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const {addToast} = useToast();
  // Load cart from localStorage when customer logs in
  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    const customer = localStorage.getItem('customer');
    
    if (token && customer) {
      const customerData = JSON.parse(customer);
      setCustomerId(customerData.customer_Id);
      
      // Load cart for this customer
      const savedCart = localStorage.getItem(`cart_${customerData.customer_Id}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]);
      }
    } else {
      // Not logged in, clear cart
      setCartItems([]);
      setCustomerId(null);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (customerId) {
      localStorage.setItem(`cart_${customerId}`, JSON.stringify(cartItems));
    }
  }, [cartItems, customerId]);

  const addToCart = (product, quantity = 1) => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      addToast('Please login to add items to your cart.', 'error');
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product_Id === product.product_Id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product_Id === product.product_Id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.product_Id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product_Id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + getUnitPrice(item) * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}