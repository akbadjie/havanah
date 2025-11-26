import React, { useRef, useState } from 'react';
import { Mic } from 'lucide-react';

const CustomAudioPlayer = ({ src, isMe }: { src: string; isMe: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 0;
      setCurrentTime(current);
      setProgress(total ? (current / total) * 100 : 0);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration || 0);
  };

  const onEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) audioRef.current.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const toggleSpeed = () => {
    const newSpeed = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(newSpeed);
    if (audioRef.current) audioRef.current.playbackRate = newSpeed;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const theme = isMe
    ? {
        icon: 'text-emerald-600',
        buttonBg: 'bg-emerald-100',
        slider: 'accent-emerald-200',
        text: 'text-emerald-100',
        speedBtn: 'bg-emerald-700 text-emerald-100'
      }
    : {
        icon: 'text-gray-500',
        buttonBg: 'bg-gray-200',
        slider: 'accent-gray-400',
        text: 'text-gray-500',
        speedBtn: 'bg-gray-200 text-gray-600'
      };

  return (
    <div className={`flex items-center gap-3 min-w-[260px] p-1 ${isMe ? 'pr-2' : ''}`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        className="hidden"
      />

      <button
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isMe ? 'bg-white' : theme.buttonBg}`}
      >
        {isPlaying ? (
          <div className="flex gap-1">
            <div className={`w-1 h-3 rounded-full ${isMe ? 'bg-emerald-600' : 'bg-gray-600'}`} />
            <div className={`w-1 h-3 rounded-full ${isMe ? 'bg-emerald-600' : 'bg-gray-600'}`} />
          </div>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ml-0.5 ${isMe ? 'text-emerald-600' : 'text-gray-600'}`}>
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1">
        <input
          type="range"
          min="0"
          max="100"
          value={progress || 0}
          onChange={handleSeek}
          className={`
            w-full h-1 rounded-lg appearance-none cursor-pointer
            ${isMe ? 'bg-emerald-800/30' : 'bg-gray-300'}
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-3 
            [&::-webkit-slider-thumb]:h-3 
            [&::-webkit-slider-thumb]:rounded-full 
            ${isMe ? '[&::-webkit-slider-thumb]:bg-white' : '[&::-webkit-slider-thumb]:bg-emerald-500'}
          `}
        />
        <div className={`flex justify-between text-[10px] font-medium tabular-nums ${theme.text}`}>
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
         <button 
           onClick={toggleSpeed}
           className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${theme.speedBtn}`}
         >
           {playbackRate}x
         </button>
         
         <div className={`opacity-60 ${theme.text}`}>
            <Mic size={12} />
         </div>
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
