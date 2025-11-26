'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Send, Mic, StopCircle } from 'lucide-react';

interface AudioRecorderProps {
  onCancel: () => void;
  onSend: (file: File) => void;
}

const AudioRecorder = ({ onCancel, onSend }: AudioRecorderProps) => {
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 1. Start Recording on Mount
  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        // Prefer proper mime types, fallback to browser default
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/mp4';

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(100); // Collect chunks every 100ms
        setIsRecording(true);

        // Start Timer
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);

      } catch (err) {
        console.error('Microphone access denied:', err);
        onCancel();
      }
    };

    startRecording();

    // Cleanup on unmount
    return () => {
      stopMediaStream();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onCancel]);

  // Helper to kill stream
  const stopMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // 2. Format Time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. Handle Stop & Send
  const handleSend = () => {
    if (!mediaRecorderRef.current) return;

    if (mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Wait slightly for the last chunk
    setTimeout(() => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      // Convert Blob to File
      const file = new File([blob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
      
      stopMediaStream();
      onSend(file);
    }, 200);
  };

  // 4. Handle Cancel
  const handleCancel = () => {
    stopMediaStream();
    onCancel();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-[24px] p-2 shadow-md"
    >
      {/* Blinking Mic / Delete */}
      <div className="flex items-center gap-2 px-2">
        <button 
          onClick={handleCancel}
          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="Delete Recording"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Recording Visuals */}
      <div className="flex-1 flex items-center gap-3">
        <motion.div 
          animate={{ opacity: [1, 0.5, 1] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-3 h-3 rounded-full bg-red-500"
        />
        <span className="font-mono text-gray-700 font-medium w-12">
          {formatTime(duration)}
        </span>
        
        {/* Fake Waveform Visual */}
        <div className="flex-1 h-6 flex items-center gap-0.5 opacity-30 overflow-hidden">
           {[...Array(20)].map((_, i) => (
             <motion.div 
               key={i}
               animate={{ height: [4, Math.random() * 16 + 4, 4] }}
               transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
               className="w-1 bg-gray-800 rounded-full"
             />
           ))}
        </div>
      </div>

      {/* Send Button */}
      <button 
        onClick={handleSend}
        className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-transform active:scale-95"
      >
        <Send size={20} className="translate-x-0.5 translate-y-0.5" />
      </button>
    </motion.div>
  );
};

export default AudioRecorder;