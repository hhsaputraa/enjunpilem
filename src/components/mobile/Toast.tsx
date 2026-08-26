/* eslint-disable react-refresh/only-export-components */
'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, Check, AlertTriangle, Info, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast
    if (newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  onHide: (id: string) => void;
}> = ({ toasts, onHide }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] space-y-2 pt-safe-top">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onHide={onHide} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: Toast;
  onHide: (id: string) => void;
}> = ({ toast, onHide }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleHide = () => {
    setIsLeaving(true);
    setTimeout(() => onHide(toast.id), 200);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Check className="w-5 h-5" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'error':
        return 'bg-red-500/20 border-red-500/30 text-red-300';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-lg",
        "transition-all duration-300 ease-out",
        getColorClasses(),
        isVisible && !isLeaving
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-2 scale-95"
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm leading-tight">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-xs opacity-90 mt-1 leading-relaxed">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toast.action.onClick}
            className="mt-2 h-7 px-3 text-xs hover:bg-white/10"
          >
            {toast.action.label}
          </Button>
        )}
      </div>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleHide}
        className="flex-shrink-0 h-6 w-6 rounded-full hover:bg-white/10"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
};

// Predefined toast helpers
export const useToastHelpers = () => {
  const { showToast } = useToast();

  const showSuccess = (title: string, description?: string) => {
    showToast({ type: 'success', title, description });
  };

  const showError = (title: string, description?: string) => {
    showToast({ type: 'error', title, description });
  };

  const showWarning = (title: string, description?: string) => {
    showToast({ type: 'warning', title, description });
  };

  const showInfo = (title: string, description?: string) => {
    showToast({ type: 'info', title, description });
  };

  const showWatchlistAdded = (title: string) => {
    showToast({
      type: 'success',
      title: 'Ditambahkan ke Watchlist',
      description: `"${title}" berhasil ditambahkan ke watchlist kamu`,
      action: {
        label: 'Lihat Watchlist',
        onClick: () => {
          // Navigate to watchlist
          window.location.href = '/watchlist';
        },
      },
    });
  };

  const showWatchlistRemoved = (title: string) => {
    showToast({
      type: 'info',
      title: 'Dihapus dari Watchlist',
      description: `"${title}" telah dihapus dari watchlist kamu`,
    });
  };

  const showDownloadStarted = (title: string) => {
    showToast({
      type: 'info',
      title: 'Download Dimulai',
      description: `"${title}" sedang diunduh`,
      action: {
        label: 'Lihat Progress',
        onClick: () => {
          // Navigate to downloads
          window.location.href = '/downloads';
        },
      },
    });
  };

  const showOfflineMode = () => {
    showToast({
      type: 'warning',
      title: 'Mode Offline',
      description: 'Kamu sedang offline. Beberapa fitur mungkin tidak tersedia.',
      duration: 6000,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showWatchlistAdded,
    showWatchlistRemoved,
    showDownloadStarted,
    showOfflineMode,
  };
};
