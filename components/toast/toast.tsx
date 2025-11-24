'use client';

import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdCheckCircle, MdError, MdInfo, MdWarning, MdClose, MdLoop
} from 'react-icons/md';

// --- Types ---
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // 0 for infinite (loading)
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- Styles Helper ---
const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success': return 'border-emerald-500/30 bg-emerald-50/95 text-emerald-800';
    case 'error': return 'border-red-500/30 bg-red-50/95 text-red-800';
    case 'warning': return 'border-amber-500/30 bg-amber-50/95 text-amber-800';
    case 'loading': return 'border-blue-500/30 bg-blue-50/95 text-blue-800';
    default: return 'border-blue-500/30 bg-blue-50/95 text-blue-800';
  }
};

const getIconStyles = (type: ToastType) => {
  switch (type) {
    case 'success': return 'text-emerald-500 bg-emerald-100';
    case 'error': return 'text-red-500 bg-red-100';
    case 'warning': return 'text-amber-500 bg-amber-100';
    default: return 'text-blue-500 bg-blue-100';
  }
};

// 1. Toast Icon Helper
const ToastIcon = ({ type }: { type: ToastType }) => {
  const baseClass = "flex items-center justify-center w-10 h-10 min-w-[40px] rounded-xl text-2xl backdrop-blur-sm border border-white/60 shadow-sm";
  const colorClass = getIconStyles(type);

  switch (type) {
    case 'success': return <div className={`${baseClass} ${colorClass}`}><MdCheckCircle /></div>;
    case 'error': return <div className={`${baseClass} ${colorClass}`}><MdError /></div>;
    case 'warning': return <div className={`${baseClass} ${colorClass}`}><MdWarning /></div>;
    case 'loading': return <div className={`${baseClass} ${colorClass}`}><MdLoop className="animate-spin" /></div>;
    default: return <div className={`${baseClass} ${colorClass}`}><MdInfo /></div>;
  }
};

// 2. Individual Toast Item
const ToastItem = ({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void; }) => {
  useEffect(() => {
    // Auto-dismiss logic (unless it's loading or duration is 0)
    if (toast.duration && toast.duration > 0 && toast.type !== 'loading') {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`relative flex items-start gap-4 p-4 min-w-[320px] max-w-md rounded-2xl border backdrop-blur-xl shadow-lg shadow-gray-200/50 overflow-hidden ${getToastStyles(toast.type)}`}
    >
      {/* Icon */}
      <div className="z-10 mt-0.5">
        <ToastIcon type={toast.type} />
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col gap-1 z-10">
        <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
        {toast.message && <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-start gap-2 z-10 pl-2">
        {toast.action && (
          <button 
            className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-md whitespace-nowrap"
            onClick={(e) => { e.stopPropagation(); toast.action?.onClick(); onRemove(toast.id); }}
          >
            {toast.action.label}
          </button>
        )}
        <button 
          className="p-1 opacity-50 hover:opacity-100 hover:bg-black/5 rounded-md transition-all"
          onClick={() => onRemove(toast.id)}
        >
          <MdClose size={18} />
        </button>
      </div>

      {/* Progress Bar (Visual only) */}
      {toast.duration && toast.duration > 0 && toast.type !== 'loading' && (
        <motion.div 
          className="absolute bottom-0 left-0 h-1 bg-current opacity-20"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};

// 3. Toast Container
const ToastContainer = ({ toasts, removeToast }: { toasts: ToastMessage[], removeToast: (id: string) => void }) => {
  return (
    <div className="fixed top-24 right-4 sm:right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-[400px]">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto flex justify-end">
             <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// --- Provider ---
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id, duration: toast.duration ?? 5000 }]);
    return id; // Return ID so we can remove it manually (e.g. for loading toasts)
  }, []);

  const clearAll = useCallback(() => setToasts([]), []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// --- Hook ---
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  
  const { addToast, removeToast, clearAll } = context;

  return {
    success: (title: string, message?: string, duration?: number) => addToast({ type: 'success', title, message, duration }),
    error: (title: string, message?: string, duration?: number) => addToast({ type: 'error', title, message, duration }),
    warning: (title: string, message?: string, duration?: number) => addToast({ type: 'warning', title, message, duration }),
    info: (title: string, message?: string, duration?: number) => addToast({ type: 'info', title, message, duration }),
    
    // Loading toasts persist (duration: 0) until manually removed
    loading: (title: string, message?: string) => addToast({ type: 'loading', title, message, duration: 0 }),
    
    custom: (options: Omit<ToastMessage, 'id'>) => addToast(options),
    remove: removeToast,
    clearAll
  };
}

export default ToastProvider;