import { useRef, useState } from 'react';
import './player.css';

export const ProgressBar = ({ currentTime, duration, bufferedProgress = 0, onSeek }) => {
  const containerRef = useRef(null);
  const [hoverTime, setHoverTime] = useState(0);
  const [hoverX, setHoverX] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const getPercentage = () => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  };

  const calculateTimeFromX = (e) => {
    if (!containerRef.current || !duration) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    return pct * duration;
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoverX(Math.max(0, Math.min(rect.width, x)));
    setHoverTime(calculateTimeFromX(e));
  };

  const handleMouseDown = (e) => {
    setIsScrubbing(true);
    onSeek(calculateTimeFromX(e));

    const handleMouseMoveGlobal = (evt) => {
      onSeek(calculateTimeFromX(evt));
    };

    const handleMouseUpGlobal = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };

    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);
  };

  return (
    <div 
      ref={containerRef}
      className="player-progress-bar-container"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
    >
      {/* Buffered bar */}
      <div 
        className="player-progress-buffered" 
        style={{ width: `${bufferedProgress * 100}%` }}
      />
      
      {/* Current progress bar */}
      <div 
        className="player-progress-current" 
        style={{ width: `${getPercentage()}%` }}
      />
      
      {/* Scrub handle */}
      <div 
        className="player-progress-handle" 
        style={{ left: `${getPercentage()}%` }}
      />

      {/* Preview Time popup */}
      <div 
        className="player-progress-preview-popup"
        style={{ left: `${hoverX}px` }}
      >
        {formatTime(hoverTime)}
      </div>
    </div>
  );
};
