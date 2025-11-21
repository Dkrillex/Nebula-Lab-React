import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let toastListeners: ((toast: ToastMessage) => void)[] = [];

export const toast = {
  success: (message: string, duration = 3000) => {
    const id = Date.now().toString();
    toastListeners.forEach(listener => listener({ id, type: 'success', message, duration }));
  },
  error: (message: string, duration = 3000) => {
    const id = Date.now().toString();
    toastListeners.forEach(listener => listener({ id, type: 'error', message, duration }));
  },
  warning: (message: string, duration = 3000) => {
    const id = Date.now().toString();
    toastListeners.forEach(listener => listener({ id, type: 'warning', message, duration }));
  },
  info: (message: string, duration = 3000) => {
    const id = Date.now().toString();
    toastListeners.forEach(listener => listener({ id, type: 'info', message, duration }));
  },
};

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (newToast: ToastMessage) => {
      setToasts(prev => [...prev, newToast]);

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, newToast.duration || 3000);
    };

    toastListeners.push(listener);

    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} className="text-green-500" />;
      case 'error':
        return <XCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-500" />;
      case 'info':
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm animate-slide-in-right ${getStyles(toast.type)}`}
          style={{
            minWidth: '300px',
            maxWidth: '500px',
          }}
        >
          {getIcon(toast.type)}
          <span className="flex-1 text-sm text-foreground">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

