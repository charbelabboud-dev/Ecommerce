import React, { useEffect } from 'react';
import './ConfirmDialog.css';

function ConfirmDialog({ message, onConfirm, onCancel }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn confirm-ok" onClick={onConfirm}>✓ Yes, Delete</button>
          <button className="confirm-btn confirm-cancel" onClick={onCancel}>✗ Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;