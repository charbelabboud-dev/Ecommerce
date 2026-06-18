
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import API from '../services/api';
import { useToast } from './ToastContext';
import { getUnitPrice } from '../utils/pricing';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function getCartItemKey(productId, variantId) {
  return `${productId}-${variantId || 'base'}`;
}

function mapApiItemToCart(apiItem) {
  const product = apiItem.product || {};
  return {
    ...product,
    product_Id: apiItem.cartItem_ProductId || product.product_Id,
    variantId: apiItem.cartItem_VariantId || null,
    variant: apiItem.variant || null,
    quantity: apiItem.cartItem_Quantity,
    cartKey: getCartItemKey(apiItem.cartItem_ProductId, apiItem.cartItem_VariantId),
  };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const { addToast } = useToast();
  const syncTimer = useRef(null);
  const skipNextSync = useRef(false);

  const loadCartFromServer = useCallback(async (cid) => {
    try {
      const response = await API.get('/cart');
      const items = (response.data || []).map(mapApiItemToCart);
      skipNextSync.current = true;
      setCartItems(items);
      localStorage.setItem(`cart_${cid}`, JSON.stringify(items));
    } catch (error) {
      const savedCart = localStorage.getItem(`cart_${cid}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    const customer = localStorage.getItem('customer');

    if (token && customer) {
      const customerData = JSON.parse(customer);
      setCustomerId(customerData.customer_Id);
      loadCartFromServer(customerData.customer_Id);
    } else {
      setCartItems([]);
      setCustomerId(null);
    }
  }, [loadCartFromServer]);

  const syncToServer = useCallback(async (items, cid) => {
    if (!cid) return;
    setSyncing(true);
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.product_Id,
          variantId: item.variantId || null,
          quantity: item.quantity,
        })),
      };
      await API.put('/cart/sync', payload);
    } catch (error) {
      console.error('Cart sync failed:', error);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (!customerId) return;

    if (skipNextSync.current) {
      skipNextSync.current = false;
      localStorage.setItem(`cart_${customerId}`, JSON.stringify(cartItems));
      return;
    }

    localStorage.setItem(`cart_${customerId}`, JSON.stringify(cartItems));

    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      syncToServer(cartItems, customerId);
    }, 600);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [cartItems, customerId, syncToServer]);

  const addToCart = (product, quantity = 1, variant = null) => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      addToast('Please login to add items to your cart.', 'error');
      return;
    }

    const variantId = variant?.productVariant_Id || null;
    const cartKey = getCartItemKey(product.product_Id, variantId);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.cartKey === cartKey);

      if (existingItem) {
        return prevItems.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prevItems,
        {
          ...product,
          variantId,
          variant,
          quantity,
          cartKey,
        },
      ];
    });
  };

  const removeFromCart = (cartKey) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (customerId) {
      API.delete('/cart').catch(() => {});
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      let price = getUnitPrice(item);
      if (item.variant) {
        if (item.product_PriceUSD && item.variant.productVariant_PriceAdjustmentUSD) {
          price += item.variant.productVariant_PriceAdjustmentUSD;
        }
        if (item.product_PriceLBP && item.variant.productVariant_PriceAdjustmentLBP) {
          price += item.variant.productVariant_PriceAdjustmentLBP;
        }
      }
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        syncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
