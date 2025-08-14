"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, [removeToast]);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-lg shadow-lg border-l-4 min-w-[320px] max-w-[400px]"
            style={{
              borderLeftColor: getToastColor(toast.type)
            }}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getToastIcon(toast.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {toast.title}
                    </h4>
                    {toast.message && (
                      <p className="text-sm text-gray-600">
                        {toast.message}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function getToastColor(type: ToastType): string {
  switch (type) {
    case 'success':
      return '#10B981'; // green-500
    case 'error':
      return '#EF4444'; // red-500
    case 'warning':
      return '#F59E0B'; // yellow-500
    case 'info':
      return '#3B82F6'; // blue-500
    default:
      return '#6B7280'; // gray-500
  }
}

function getToastIcon(type: ToastType): React.ReactNode {
  switch (type) {
    case 'success':
      return <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">✅</div>;
    case 'error':
      return <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">❌</div>;
    case 'warning':
      return <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">⚠️</div>;
    case 'info':
      return <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">ℹ️</div>;
    default:
      return <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">📢</div>;
  }
}
