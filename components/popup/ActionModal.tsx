'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Ban, Flag, X, Loader2 } from 'lucide-react';

export type ActionType = 'block' | 'delete' | 'report' | null;

interface ActionModalProps {
  isOpen: boolean;
  type: ActionType;
  displayName: string; // The name of the user being acted upon
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export default function ActionModal({
  isOpen,
  type,
  displayName,
  isLoading = false,
  onClose,
  onConfirm
}: ActionModalProps) {
  const [reportReason, setReportReason] = useState('');

  // config based on action type
  const config = {
    block: {
      title: 'Block User',
      desc: `Are you sure you want to block ${displayName}? They will no longer be able to message you.`,
      icon: Ban,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      btnColor: 'bg-orange-600 hover:bg-orange-700',
      btnText: 'Block User'
    },
    delete: {
      title: 'Delete Conversation',
      desc: 'This action cannot be undone. All messages and media will be permanently removed.',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      btnColor: 'bg-red-600 hover:bg-red-700',
      btnText: 'Delete Forever'
    },
    report: {
      title: 'Report User',
      desc: 'Please tell us why you are reporting this user. We take safety seriously.',
      icon: Flag,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      btnColor: 'bg-amber-600 hover:bg-amber-700',
      btnText: 'Submit Report'
    }
  };

  if (!type) return null;
  const current = config[type];
  const Icon = current.icon;

  const handleConfirmClick = () => {
    if (type === 'report' && !reportReason.trim()) return;
    onConfirm(reportReason);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            {!isLoading && (
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            )}

            <div className="p-6 pt-8 flex flex-col items-center text-center">
              {/* Icon Bubble */}
              <div className={`w-16 h-16 rounded-2xl ${current.bgColor} ${current.color} flex items-center justify-center mb-6 shadow-sm`}>
                <Icon size={32} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {current.title}
              </h3>
              
              <p className="text-gray-500 mb-6 leading-relaxed">
                {current.desc}
              </p>

              {/* Special Input for Report */}
              {type === 'report' && (
                <div className="w-full mb-6 text-left">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Reason</label>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe the issue..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none text-sm min-h-[80px]"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleConfirmClick}
                  disabled={isLoading || (type === 'report' && !reportReason.trim())}
                  className={`flex-1 py-3 px-4 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2 ${current.btnColor}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    current.btnText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}