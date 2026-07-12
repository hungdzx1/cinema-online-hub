import { useEffect, useRef, useState, useMemo } from 'react';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { SettingsMenu } from './SettingsMenu';
import './player.css';

const getYoutubeId = (url) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

export const VideoPlayer = ({ 
  movieSlug,
  embedUrl, 
  currentEpisodeNumber, 
  totalEpisodes = 1,
  onSelectEpisode 
}) => {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const ytContainerRef = useRef(null);

  // Video State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('cinema_player_volume');
    return saved !== null ? parseFloat(saved) : 1;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [ytPlayer, setYtPlayer] = useState(null);

  // Overlay states
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Ripple seek overlay state
  const [rippleState, setRippleState] = useState({ show: false, side: 'right' }); // 'left' | 'right'

  // Subtitles
  const mockSubtitles = useMemo(() => [
    { id: 1, label: 'Tiếng Việt', src: '/subtitles/vi.vtt', lang: 'vi' },
    { id: 2, label: 'Tiếng Anh', src: '/subtitles/en.vtt', lang: 'en' }
  ], []);
  const [activeSubtitleId, setActiveSubtitleId] = useState(null);

  // History & Autoplay
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [showAutoplayOverlay, setShowAutoplayOverlay] = useState(false);
  const [autoplayCountdown, setAutoplayCountdown] = useState(10);

  // Autoplay countdown timer ref
  const autoplayTimerRef = useRef(null);
  // Hide controls idle timer ref
  const controlsTimerRef = useRef(null);

  // Resolve direct video source or fallback to sample Oceans MP4
  const isYoutube = useMemo(() => {
    if (!embedUrl) return false;
    const urlLower = embedUrl.toLowerCase();
    return urlLower.includes('youtube.com') || urlLower.includes('youtu.be') || urlLower.includes('embed');
  }, [embedUrl]);

  const videoSource = useMemo(() => {
    if (!embedUrl) return '';
    if (isYoutube) {
      // If YouTube, this won't be used by HTML5 video player but we return it anyway
      return embedUrl;
    }
    return embedUrl;
  }, [embedUrl, isYoutube]);

  // YouTube API Integration
  useEffect(() => {
    if (!isYoutube) return;

    let player = null;
    let pollInterval = null;

    // Load YouTube script globally if it isn't present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const onPlayerReady = (event) => {
      setYtPlayer(event.target);
      setDuration(event.target.getDuration());
      setIsLoading(false);
      
      // Load saved watch position if user has saved history
      const historyKey = `cinema_history_${movieSlug}_${currentEpisodeNumber}`;
      const savedTime = localStorage.getItem(historyKey);
      if (savedTime) {
        event.target.seekTo(parseFloat(savedTime), true);
        setCurrentTime(parseFloat(savedTime));
      }
    };

    const onPlayerStateChange = (event) => {
      // event.data matches: YT.PlayerState.PLAYING (1), PAUSED (2), BUFFERING (3), ENDED (0)
      if (event.data === 1) { // PLAYING
        setIsPlaying(true);
        setIsLoading(false);
      } else if (event.data === 2) { // PAUSED
        setIsPlaying(false);
      } else if (event.data === 3) { // BUFFERING
        setIsLoading(true);
      } else if (event.data === 0) { // ENDED
        setIsPlaying(false);
        if (currentEpisodeNumber < totalEpisodes) {
          onSelectEpisode(currentEpisodeNumber + 1);
        }
      }
    };

    const initializeYT = () => {
      const videoId = getYoutubeId(embedUrl);
      if (!videoId || !ytContainerRef.current) return;
      try {
        player = new window.YT.Player(ytContainerRef.current, {
          videoId: videoId,
          playerVars: {
            controls: 0,
            disablekb: 1,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            fs: 0
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: () => {
              setHasError(true);
              setIsLoading(false);
            }
          }
        });
      } catch (err) {
        console.error("Error creating YT.Player:", err);
      }
    };

    // Poll until window.YT and window.YT.Player are fully ready
    pollInterval = setInterval(() => {
      if (window.YT && window.YT.Player && ytContainerRef.current) {
        clearInterval(pollInterval);
        initializeYT();
      }
    }, 100);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (player && player.destroy) {
        try {
          player.destroy();
        } catch (e) {
          // ignore
        }
      }
      setYtPlayer(null);
    };
  }, [embedUrl, isYoutube, currentEpisodeNumber, movieSlug]);

  // Sync volume state
  useEffect(() => {
    if (isYoutube && ytPlayer) {
      if (isMuted) {
        ytPlayer.mute();
      } else {
        ytPlayer.unMute();
        ytPlayer.setVolume(volume * 100);
      }
    } else if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
    localStorage.setItem('cinema_player_volume', String(volume));
  }, [volume, isMuted, ytPlayer, isYoutube]);

  // Interval query of YT player current time
  useEffect(() => {
    let interval = null;
    if (isYoutube && ytPlayer && isPlaying) {
      interval = setInterval(() => {
        try {
          const time = ytPlayer.getCurrentTime();
          setCurrentTime(time);
          
          // Save history every 5 seconds
          if (Math.floor(time) % 5 === 0) {
            localStorage.setItem(`cinema_history_${movieSlug}_${currentEpisodeNumber}`, String(time));
          }

          // Next episode trigger
          if (duration > 20 && duration - time <= 10 && currentEpisodeNumber < totalEpisodes) {
            if (!showAutoplayOverlay && !autoplayTimerRef.current) {
              setShowAutoplayOverlay(true);
              setAutoplayCountdown(10);
            }
          }
        } catch (e) {
          // ignore potential frame errors
        }
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlaying, ytPlayer, isYoutube, duration, currentEpisodeNumber, movieSlug, showAutoplayOverlay]);

  // Load new source / Reset states
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setBufferedProgress(0);
    setIsLoading(true);
    setHasError(false);
    setShowAutoplayOverlay(false);
    setShowResumeDialog(false);

    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.playbackRate = playbackRate;
    }

    // Check watch history
    const historyKey = `cinema_history_${movieSlug}_${currentEpisodeNumber}`;
    const savedTime = localStorage.getItem(historyKey);
    if (savedTime && parseFloat(savedTime) > 5) {
      setResumeTime(parseFloat(savedTime));
      setShowResumeDialog(true);
    }
  }, [videoSource, currentEpisodeNumber, movieSlug]);

  // Idle timer to auto hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettings(false);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [isPlaying]);

  // Handle media hooks
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Save history every 5 seconds
    if (Math.floor(time) % 5 === 0) {
      localStorage.setItem(`cinema_history_${movieSlug}_${currentEpisodeNumber}`, String(time));
    }

    // Trigger autoplay next episode overlay 10 seconds before video end
    if (duration > 20 && duration - time <= 10 && currentEpisodeNumber < totalEpisodes) {
      if (!showAutoplayOverlay && !autoplayTimerRef.current) {
        setShowAutoplayOverlay(true);
        setAutoplayCountdown(10);
      }
    } else {
      if (showAutoplayOverlay) {
        setShowAutoplayOverlay(false);
        if (autoplayTimerRef.current) {
          clearInterval(autoplayTimerRef.current);
          autoplayTimerRef.current = null;
        }
      }
    }
  };

  // Autoplay countdown timer execution
  useEffect(() => {
    if (showAutoplayOverlay) {
      autoplayTimerRef.current = setInterval(() => {
        setAutoplayCountdown(prev => {
          if (prev <= 1) {
            clearInterval(autoplayTimerRef.current);
            autoplayTimerRef.current = null;
            setShowAutoplayOverlay(false);
            onSelectEpisode(currentEpisodeNumber + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    }

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [showAutoplayOverlay, currentEpisodeNumber, onSelectEpisode]);

  const handleProgress = () => {
    if (!videoRef.current || !duration) return;
    const buf = videoRef.current.buffered;
    if (buf.length > 0) {
      const lastBuffered = buf.end(buf.length - 1);
      setBufferedProgress(lastBuffered / duration);
    }
  };

  const handlePlayPause = () => {
    if (isYoutube && ytPlayer) {
      if (isPlaying) {
        ytPlayer.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayer.playVideo();
        setIsPlaying(true);
      }
      handleMouseMove();
      return;
    }
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setHasError(true);
      });
    }
    handleMouseMove();
  };

  const handleSeek = (time) => {
    if (isYoutube && ytPlayer) {
      ytPlayer.seekTo(time, true);
      setCurrentTime(time);
      return;
    }
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSkip = (amount) => {
    let current = currentTime;
    if (isYoutube && ytPlayer) {
      current = ytPlayer.getCurrentTime() || currentTime;
    } else if (videoRef.current) {
      current = videoRef.current.currentTime;
    } else return;

    let target = current + amount;
    target = Math.max(0, Math.min(duration, target));
    handleSeek(target);
  };

  const handleDoubleSeek = (e) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftSide = clickX < rect.width / 2;

    if (isLeftSide) {
      handleSkip(-10);
      setRippleState({ show: true, side: 'left' });
    } else {
      handleSkip(10);
      setRippleState({ show: true, side: 'right' });
    }

    setTimeout(() => {
      setRippleState(prev => ({ ...prev, show: false }));
    }, 600);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid firing if typing in input/textarea (like comment boxes or search)
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      const key = e.key.toLowerCase();
      
      switch (key) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'arrowleft':
          e.preventDefault();
          handleSkip(-5);
          break;
        case 'arrowright':
          e.preventDefault();
          handleSkip(5);
          break;
        case 'j':
          e.preventDefault();
          handleSkip(-10);
          break;
        case 'l':
          e.preventDefault();
          handleSkip(10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.05));
          setIsMuted(false);
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.05));
          break;
        case 'm':
          e.preventDefault();
          setIsMuted(prev => !prev);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          // Jump to percentage on digits 0-9
          if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            const pct = parseInt(e.key, 10) * 10;
            const targetTime = (pct / 100) * duration;
            handleSeek(targetTime);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, duration]);

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;

    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPip(false);
      } else {
        await videoRef.current.requestPictureInPicture();
        setIsPip(true);
      }
    } catch (e) {
      console.warn("PIP not supported or failed", e);
    }
  };

  const handleResume = (confirm) => {
    setShowResumeDialog(false);
    if (confirm && videoRef.current) {
      videoRef.current.currentTime = resumeTime;
      setCurrentTime(resumeTime);
      videoRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const formatTimeText = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div 
      ref={wrapperRef}
      className={`custom-video-player-wrapper ${isPlaying ? '' : 'paused'} ${showControls ? 'show-controls' : 'hide-cursor'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
          setShowSettings(false);
        }
      }}
    >
      {/* Video Content */}
      {isYoutube ? (
        <div 
          key={embedUrl}
          ref={ytContainerRef}
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        />
      ) : (
        <video
          ref={videoRef}
          src={videoSource}
          className="html5-video-element"
          onClick={handlePlayPause}
          onDoubleClick={handleDoubleSeek}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleProgress}
          onLoadedData={() => {
            setIsLoading(false);
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          onEnded={() => {
            setIsPlaying(false);
            if (currentEpisodeNumber < totalEpisodes) {
              onSelectEpisode(currentEpisodeNumber + 1);
            }
          }}
        >
          {activeSubtitleId && (
            <track 
              src={mockSubtitles.find(s => s.id === activeSubtitleId)?.src}
              kind="subtitles"
              srcLang={mockSubtitles.find(s => s.id === activeSubtitleId)?.lang}
              label={mockSubtitles.find(s => s.id === activeSubtitleId)?.label}
              default
            />
          )}
        </video>
      )}

      {/* Transparent overlay above video and iframe to capture custom mouse inputs */}
      <div 
        className="player-video-overlay" 
        onClick={handlePlayPause}
        onDoubleClick={handleDoubleSeek}
      />

      {/* Ripple Seek Ripple Indicator overlays */}
      <div className={`double-click-ripple-overlay left ${rippleState.show && rippleState.side === 'left' ? 'active' : ''}`}>
        <span className="ripple-arrows">◀◀◀</span>
        <span>Lùi 10 giây</span>
      </div>
      <div className={`double-click-ripple-overlay right ${rippleState.show && rippleState.side === 'right' ? 'active' : ''}`}>
        <span className="ripple-arrows">▶▶▶</span>
        <span>Tiến 10 giây</span>
      </div>

      {/* Large central play/pause overlay */}
      <div className="player-pause-overlay" onClick={handlePlayPause}>
        <div className="player-pause-icon-circle">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <div className="player-loading-overlay">
          <div className="player-spinner"></div>
          <span style={{ fontSize: '13px' }}>Đang tải phim...</span>
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="player-error-overlay">
          <span className="player-error-icon">⚠️</span>
          <h3>Không thể tải video</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Nguồn video này bị lỗi hoặc không khả dụng.
          </p>
          <button className="player-retry-btn" onClick={() => {
            setHasError(false);
            setIsLoading(true);
            if (videoRef.current) videoRef.current.load();
          }}>Thử lại</button>
        </div>
      )}

      {/* Resume Watch History dialog */}
      {showResumeDialog && (
        <div className="watch-resume-dialog">
          <span>Tiếp tục xem từ {formatTimeText(resumeTime)}?</span>
          <button className="watch-resume-btn" onClick={() => handleResume(true)}>Xem tiếp</button>
          <button className="watch-resume-cancel" onClick={() => handleResume(false)}>Xem từ đầu</button>
        </div>
      )}

      {/* Autoplay Next Episode Countdown dialog */}
      {showAutoplayOverlay && (
        <div className="player-autoplay-overlay">
          <span style={{ fontWeight: 'bold' }}>Tập tiếp theo sau {autoplayCountdown} giây</span>
          <div className="autoplay-buttons">
            <button className="autoplay-btn-now" onClick={() => {
              setShowAutoplayOverlay(false);
              onSelectEpisode(currentEpisodeNumber + 1);
            }}>Xem ngay</button>
            <button className="autoplay-btn-cancel" onClick={() => setShowAutoplayOverlay(false)}>Hủy</button>
          </div>
        </div>
      )}

      {/* Settings Menu Popup */}
      {showSettings && (
        <SettingsMenu
          playbackRate={playbackRate}
          onPlaybackRateChange={(rate) => {
            setPlaybackRate(rate);
            if (videoRef.current) videoRef.current.playbackRate = rate;
          }}
          subtitles={mockSubtitles}
          activeSubtitleId={activeSubtitleId}
          onSubtitleChange={setActiveSubtitleId}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Overlay Control Bar */}
      <div className="player-controls-overlay">
        {/* Progress scrub bar */}
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          bufferedProgress={bufferedProgress}
          onSeek={handleSeek}
        />

        <div className="player-controls-row">
          {/* Left Controls */}
          <div className="player-controls-left">
            {/* Play / Pause */}
            <button className="player-ctrl-btn" onClick={handlePlayPause}>
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            {/* Skip Back 10s */}
            <button className="player-ctrl-btn" title="Lùi 10s" onClick={() => handleSkip(-10)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>

            {/* Skip Forward 10s */}
            <button className="player-ctrl-btn" title="Tiến 10s" onClick={() => handleSkip(10)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>

            {/* Volume */}
            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={(v) => {
                setVolume(v);
                setIsMuted(v === 0);
              }}
              onToggleMute={() => setIsMuted(prev => !prev)}
            />

            {/* Time Display */}
            <div className="player-time-display">
              {formatTimeText(currentTime)} / {formatTimeText(duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="player-controls-right">
            {/* Settings trigger */}
            <button className="player-ctrl-btn" title="Cài đặt" onClick={() => setShowSettings(!showSettings)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {/* Picture in Picture */}
            <button className="player-ctrl-btn" title="Picture in Picture" onClick={togglePip}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" />
                <rect x="13" y="13" width="7" height="7" />
              </svg>
            </button>

            {/* Fullscreen */}
            <button className="player-ctrl-btn" title="Toàn màn hình" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 14h6v6" /><path d="M20 10h-6V4" /><path d="M14 10l7-7" /><path d="M10 14l-7 7" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /><path d="M10 14l-7 7" /><path d="M14 10l7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
