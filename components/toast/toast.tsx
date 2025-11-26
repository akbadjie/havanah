'use client';

import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdCheckCircle, MdError, MdInfo, MdWarning, MdClose, MdLoop, MdCloudUpload 
} from 'react-icons/md';

// --- Types ---
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'progress';

export interface ToastProgress {
  percent: number;      // 0 to 100
  loaded: number;       // Bytes loaded
  total: number;        // Total bytes
  rate?: number;        // Bytes per second
  estimatedSeconds?: number; // Seconds remaining
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // 0 for infinite
  progress?: ToastProgress; // New field for upload stats
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => string;
  updateToast: (id: string, updates: Partial<ToastMessage>) => void; // New method
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- Utils ---

const formatBytes = (bytes: number, decimals = 1) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatTime = (seconds: number) => {
  if (!seconds || !isFinite(seconds)) return '';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
};

// --- Styles Helper ---
const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success': return 'border-emerald-500/30 bg-emerald-50/95 text-emerald-900';
    case 'error': return 'border-red-500/30 bg-red-50/95 text-red-900';
    case 'warning': return 'border-amber-500/30 bg-amber-50/95 text-amber-900';
    case 'loading': 
    case 'progress': return 'border-blue-500/30 bg-blue-50/95 text-blue-900';
    default: return 'border-blue-500/30 bg-blue-50/95 text-blue-900';
  }
};

const getIconStyles = (type: ToastType) => {
  switch (type) {
    case 'success': return 'text-emerald-600 bg-emerald-100';
    case 'error': return 'text-red-600 bg-red-100';
    case 'warning': return 'text-amber-600 bg-amber-100';
    case 'loading':
    case 'progress': return 'text-blue-600 bg-blue-100';
    default: return 'text-blue-600 bg-blue-100';
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
    case 'progress': return <div className={`${baseClass} ${colorClass}`}><MdCloudUpload className="animate-pulse" /></div>;
    default: return <div className={`${baseClass} ${colorClass}`}><MdInfo /></div>;
  }
};

// 2. Individual Toast Item
const ToastItem = ({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void; }) => {
  const isProgress = toast.type === 'progress' && toast.progress;

  useEffect(() => {
    // Auto-dismiss logic (unless it's loading, progress, or duration is 0)
    if (toast.duration && toast.duration > 0 && toast.type !== 'loading' && toast.type !== 'progress') {
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
      className={`relative flex items-start gap-3 p-4 min-w-[340px] max-w-md rounded-2xl border backdrop-blur-xl shadow-lg shadow-gray-200/50 overflow-hidden ${getToastStyles(toast.type)}`}
    >
      {/* Icon */}
      <div className="z-10 mt-0.5">
        <ToastIcon type={toast.type} />
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col gap-1 z-10 mr-4">
        <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
        
        {/* Standard Message */}
        {toast.message && !isProgress && (
          <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>
        )}

        {/* Upload Progress UI */}
        {isProgress && toast.progress && (
          <div className="w-full mt-1 space-y-2">
            {/* Stats Row */}
            <div className="flex justify-between items-end text-[10px] font-medium opacity-80 uppercase tracking-wide">
              <span>{formatBytes(toast.progress.loaded)} / {formatBytes(toast.progress.total)}</span>
              <span>{Math.round(toast.progress.percent)}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${toast.progress.percent}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
              />
            </div>

            {/* Speed & Time Row */}
            <div className="flex justify-between text-[10px] opacity-70">
              <span>{toast.progress.rate ? `${formatBytes(toast.progress.rate)}/s` : 'Starting...'}</span>
              <span>{toast.progress.estimatedSeconds ? `${formatTime(toast.progress.estimatedSeconds)} left` : ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-start gap-2 z-10 absolute top-3 right-3">
        {toast.action && (
          <button 
            className="px-3 py-1 bg-gray-900/10 hover:bg-gray-900/20 text-xs font-bold rounded-lg transition-colors"
            onClick={(e) => { e.stopPropagation(); toast.action?.onClick(); onRemove(toast.id); }}
          >
            {toast.action.label}
          </button>
        )}
        <button 
          className="p-1 opacity-40 hover:opacity-100 hover:bg-black/5 rounded-md transition-all"
          onClick={() => onRemove(toast.id)}
        >
          <MdClose size={16} />
        </button>
      </div>

      {/* Auto-dismiss Timer Bar (for standard toasts) */}
      {toast.duration && toast.duration > 0 && toast.type !== 'loading' && toast.type !== 'progress' && (
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
    return id; 
  }, []);

  // NEW: Update an existing toast (e.g. for progress updates)
  const updateToast = useCallback((id: string, updates: Partial<ToastMessage>) => {
    setToasts((prev) => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const clearAll = useCallback(() => setToasts([]), []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// --- Hook ---
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  
  const { addToast, updateToast, removeToast, clearAll } = context;

  return {
    success: (title: string, message?: string, duration?: number) => addToast({ type: 'success', title, message, duration }),
    error: (title: string, message?: string, duration?: number) => addToast({ type: 'error', title, message, duration }),
    warning: (title: string, message?: string, duration?: number) => addToast({ type: 'warning', title, message, duration }),
    info: (title: string, message?: string, duration?: number) => addToast({ type: 'info', title, message, duration }),
    
    // Loading toasts
    loading: (title: string, message?: string) => addToast({ type: 'loading', title, message, duration: 0 }),
    
    // Progress Toast (Returns ID to allow updates)
    progress: (title: string, message: string = 'Starting upload...') => addToast({ 
      type: 'progress', 
      title, 
      message, 
      duration: 0,
      progress: { percent: 0, loaded: 0, total: 0 } 
    }),

    // Method to update progress or convert loading toast to success/error
    update: updateToast,
    
    custom: (options: Omit<ToastMessage, 'id'>) => addToast(options),
    remove: removeToast,
    clearAll
  };
}

export default ToastProvider;