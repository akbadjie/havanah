'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, SwitchCamera, 
  Volume2, VolumeX, MoreVertical, MessageSquare, UserPlus, 
  Wifi, Lock, ChevronDown 
} from 'lucide-react';

interface ActiveCallProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideo: boolean;
  onEndCall: () => void;
  callerName: string;
  callerPhoto?: string; // Added optional photo prop
  status: string;
}

// Helper to format seconds into MM:SS
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function ActiveCall({ 
  localStream, 
  remoteStream, 
  isVideo, 
  onEndCall,
  callerName,
  callerPhoto = '/default-avatar.png',
  status
}: ActiveCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(isVideo);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isPipMinimized, setIsPipMinimized] = useState(false);

  // Toggle Controls Timer
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetControls = () => {
      setIsControlsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsControlsVisible(false), 5000);
    };

    window.addEventListener('mousemove', resetControls);
    window.addEventListener('touchstart', resetControls);
    resetControls();

    return () => {
      window.removeEventListener('mousemove', resetControls);
      window.removeEventListener('touchstart', resetControls);
      clearTimeout(timeout);
    };
  }, []);

  // Call Duration Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'answered') {
      interval = setInterval(() => setDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Attach Streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isCamOn]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Toggles
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCam = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !isCamOn);
      setIsCamOn(!isCamOn);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      className="fixed inset-0 z-[100] bg-[#f0fdf4] overflow-hidden flex flex-col font-sans"
      ref={containerRef}
    >
      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0">
        {isVideo && remoteStream ? (
          // Video Call Background
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover" 
          />
        ) : (
          // Audio Call Background (Animated Gradient)
          <div className="w-full h-full bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
            
            {/* Animated Blobs */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1], 
                rotate: [0, 90, 0],
                x: [0, 50, 0] 
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-3xl"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1], 
                x: [0, -50, 0],
                y: [0, 50, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-3xl"
            />
          </div>
        )}
        
        {/* Dark Overlay for better text visibility */}
        <div className={`absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none transition-opacity duration-500 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* --- HEADER --- */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: isControlsVisible ? 0 : -100 }}
        className="absolute top-0 left-0 right-0 z-20 p-4 pt-12 md:pt-6 flex flex-col items-center"
      >
        <div className="flex items-center gap-2 text-white/80 text-xs font-medium mb-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <Lock size={10} /> End-to-end encrypted
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md tracking-tight">
          {callerName}
        </h2>
        
        <div className="flex items-center gap-2 mt-1">
          <span className={`w-2 h-2 rounded-full ${status === 'answered' ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'}`} />
          <p className="text-white/90 font-medium text-sm drop-shadow-sm">
            {status === 'answered' ? formatDuration(duration) : status + '...'}
          </p>
        </div>
      </motion.div>

      {/* --- AUDIO CALL VISUALIZER (Avatar Ripple) --- */}
      {!isVideo && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative">
            {/* Ripples */}
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400/30 to-amber-300/30 border border-white/20"
              />
            ))}
            
            {/* Avatar */}
            <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full p-2 bg-white/20 backdrop-blur-md border border-white/50 shadow-2xl">
              <img 
                src={callerPhoto} 
                alt={callerName} 
                className="w-full h-full rounded-full object-cover border-4 border-white/80 shadow-inner" 
              />
              <div className="absolute bottom-4 right-4 bg-emerald-500 p-2 rounded-full border-4 border-white shadow-lg text-white">
                 <Mic size={20} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CONNECTION STATUS --- */}
      <div className="absolute top-6 right-6 z-20 hidden md:flex items-center gap-2 text-white/80 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
        <Wifi size={16} />
        <span className="text-xs font-semibold">Good</span>
      </div>

      {/* --- DRAGGABLE LOCAL VIDEO (PiP) --- */}
      {isVideo && localStream && isCamOn && (
        <motion.div 
          drag
          dragConstraints={containerRef}
          dragElastic={0.1}
          whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
          initial={{ x: 0, y: 0 }}
          className="absolute z-30 right-4 bottom-32 w-32 h-48 md:w-40 md:h-60 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 bg-black cursor-grab touch-none"
        >
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]" 
          />
          <div className="absolute bottom-2 left-2 text-white/70 text-[10px] bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
            You
          </div>
        </motion.div>
      )}

      {/* --- FOOTER CONTROLS --- */}
      <motion.div 
        initial={{ y: 200 }}
        animate={{ y: isControlsVisible ? 0 : 200 }}
        transition={{ type: 'spring', damping: 20 }}
        className="absolute bottom-0 left-0 right-0 z-40"
      >
        {/* Secondary Actions Bar */}
        <div className="flex justify-center gap-6 mb-6">
           <ActionButton icon={<MessageSquare size={20} />} label="Chat" onClick={() => {}} />
           <ActionButton icon={<UserPlus size={20} />} label="Add" onClick={() => {}} />
           <ActionButton 
              icon={isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />} 
              label="Speaker" 
              onClick={() => setIsSpeakerOn(!isSpeakerOn)} 
              active={isSpeakerOn}
           />
           <ActionButton icon={<SwitchCamera size={20} />} label="Flip" onClick={() => {}} />
        </div>

        {/* Main Controls Dock */}
        <div className="mx-4 mb-6 p-4 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center justify-between md:justify-center md:gap-12 relative overflow-hidden">
          {/* Glass Reflection */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          {/* Mic Toggle */}
          <button 
            onClick={toggleMic}
            className={`
              relative p-4 md:p-5 rounded-full transition-all duration-300 group
              ${isMicOn ? 'bg-white/20 text-white hover:bg-white hover:text-emerald-600' : 'bg-white text-gray-900'}
            `}
          >
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isMicOn ? 'Mute' : 'Unmute'}
            </span>
          </button>

          {/* End Call (Center, Large) */}
          <button 
            onClick={onEndCall}
            className="p-6 md:p-7 bg-red-500 text-white rounded-[2rem] shadow-lg shadow-red-500/40 hover:bg-red-600 hover:scale-105 hover:shadow-red-500/60 transition-all duration-300 active:scale-95"
          >
            <PhoneOff size={32} fill="currentColor" />
          </button>

          {/* Video Toggle */}
          <button 
            onClick={toggleCam}
            className={`
              relative p-4 md:p-5 rounded-full transition-all duration-300 group
              ${isCamOn ? 'bg-white/20 text-white hover:bg-white hover:text-emerald-600' : 'bg-white text-gray-900'}
            `}
          >
            {isCamOn ? <Video size={24} /> : <VideoOff size={24} />}
             <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isCamOn ? 'Stop Video' : 'Start Video'}
            </span>
          </button>
        </div>
        
        {/* Swipe Handle for Mobile */}
        <div className="w-full h-6 flex justify-center pb-2 md:hidden">
            <div className="w-16 h-1 bg-white/30 rounded-full" />
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- SUB-COMPONENT: Action Button ---
const ActionButton = ({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-1 group"
  >
    <div className={`
      p-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300
      ${active 
        ? 'bg-emerald-500/80 text-white' 
        : 'bg-black/20 text-white hover:bg-white/20'}
    `}>
      {icon}
    </div>
    <span className="text-[10px] font-medium text-white/80 group-hover:text-white drop-shadow-sm">
      {label}
    </span>
  </button>
);