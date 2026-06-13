import React, { createContext, useState, useContext, useRef } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = (message, type = 'info') => {
    toastIdRef.current += 1;
    const id = `${Date.now()}-${toastIdRef.current}`;

    setToasts((prev) => {
      const alreadyShowing = prev.some(
        (toast) => toast.message === message && toast.type === type
      );
      if (alreadyShowing) return prev;
      return [...prev, { id, message, type }];
    });
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}