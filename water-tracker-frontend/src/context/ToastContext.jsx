import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '420px'
      }}>
        {toasts.map((toast) => {
          let bgColor = 'rgba(16, 28, 52, 0.95)';
          let borderColor = 'rgba(255, 255, 255, 0.1)';
          let icon = <Info size={20} color="#00e5ff" />;

          if (toast.type === 'success') {
            borderColor = 'rgba(16, 185, 129, 0.4)';
            icon = <CheckCircle2 size={20} color="#10b981" />;
          } else if (toast.type === 'error') {
            borderColor = 'rgba(239, 68, 68, 0.5)';
            icon = <AlertCircle size={20} color="#ef4444" />;
          } else if (toast.type === 'warning') {
            borderColor = 'rgba(245, 158, 11, 0.4)';
            icon = <AlertTriangle size={20} color="#f59e0b" />;
          }

          return (
            <div
              key={toast.id}
              style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                backdropFilter: 'blur(16px)',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'slideUp 0.25s ease',
                color: '#f1f5f9',
                fontSize: '0.9rem'
              }}
            >
              {icon}
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
