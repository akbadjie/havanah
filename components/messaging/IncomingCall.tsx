'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, Mic, Wifi } from 'lucide-react';

interface IncomingCallProps {
  callerName: string;
  callerPhoto?: string;
  type: 'video' | 'audio';
  onAnswer: () => void;
  onReject: () => void;
}

export default function IncomingCall({ 
  callerName, 
  callerPhoto = '/default-avatar.png', 
  type, 
  onAnswer, 
  onReject 
}: IncomingCallProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
    >
      {/* --- 3D FLOATING CARD --- */}
      <motion.div 
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="relative w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/60 overflow-hidden"
      >
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50/80 to-transparent" />
        
        {/* --- CONTENT --- */}
        <div className="relative z-10 flex flex-col items-center pt-12 pb-8 px-6">
          
          {/* 1. PULSING AVATAR SECTION */}
          <div className="relative mb-6">
            {/* Ripple Effects */}
            {[1, 2, 3].map((i) => (
               <motion.div
                 key={i}
                 className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                 initial={{ opacity: 0, scale: 1 }}
                 animate={{ opacity: [0, 0.5, 0], scale: [1, 1.8] }}
                 transition={{ 
                   duration: 2, 
                   repeat: Infinity, 
                   delay: i * 0.4,
                   ease: "easeOut" 
                 }}
               />
            ))}
            
            {/* Main Avatar Container */}
            <div className="relative w-28 h-28 rounded-full p-1.5 bg-gradient-to-tr from-emerald-400 via-emerald-200 to-amber-300 shadow-xl shadow-emerald-500/20 z-20">
               <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-gray-100">
                  <img src={callerPhoto} alt={callerName} className="w-full h-full object-cover" />
               </div>
               
               {/* Call Type Icon Badge */}
               <div className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md text-emerald-600 border border-gray-100">
                 {type === 'video' ? <Video size={18} fill="currentColor" className="opacity-20 text-emerald-600" /> : <Mic size={18} />}
                 {type === 'video' && <div className="absolute inset-0 flex items-center justify-center"><Video size={18} /></div>}
               </div>
            </div>
          </div>

          {/* 2. TEXT INFO */}
          <div className="text-center mb-8 space-y-1">
             <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
               {callerName}
             </h3>
             <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium text-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Incoming {type === 'video' ? 'Video' : 'Audio'} Call...
             </div>
          </div>

          {/* 3. ACTION BUTTONS */}
          <div className="w-full flex items-center justify-between px-4">
            
            {/* DECLINE */}
            <div className="flex flex-col items-center gap-2">
              <motion.button 
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={onReject}
                className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center shadow-lg shadow-red-100 border border-red-100 transition-colors hover:bg-red-500 hover:text-white"
              >
                <PhoneOff size={28} />
              </motion.button>
              <span className="text-xs font-bold text-gray-400">Decline</span>
            </div>

            {/* ANSWER (Prominent) */}
            <div className="flex flex-col items-center gap-2">
              <motion.button 
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                whileHover={{ scale: 1.2, backgroundColor: '#059669' }} // emerald-600
                whileTap={{ scale: 0.95 }}
                onClick={onAnswer}
                className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40 border-4 border-white ring-4 ring-emerald-50"
              >
                <Phone size={36} className="animate-bounce" />
              </motion.button>
              <span className="text-xs font-bold text-emerald-600">Accept</span>
            </div>
            
             {/* MESSAGE (Optional Quick Reply placeholder) */}
             <div className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center border border-gray-100">
                <Wifi size={20} />
              </div>
              <span className="text-[10px] font-bold text-gray-400">Reply</span>
            </div>

          </div>
        </div>

        {/* Footer Gradient Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400" />
      </motion.div>
    </motion.div>
  );
}