import { useState } from 'react';
import './player.css';

export const SettingsMenu = ({ 
  playbackRate, 
  onPlaybackRateChange,
  subtitles = [],
  activeSubtitleId,
  onSubtitleChange,
  onClose
}) => {
  const [currentMenu, setCurrentMenu] = useState('main'); // 'main' | 'speed' | 'subtitles'

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const getSubtitleLabel = (id) => {
    if (id === null) return 'Tắt';
    const found = subtitles.find(s => s.id === id);
    return found ? found.label : 'Tắt';
  };

  return (
    <div className="player-settings-overlay">
      {currentMenu === 'main' && (
        <div className="settings-main-menu">
          {/* Speed Selector option */}
          <div className="settings-menu-item" onClick={() => setCurrentMenu('speed')}>
            <span>Tốc độ phát</span>
            <span style={{ color: 'var(--text-muted)' }}>{playbackRate === 1 ? 'Mặc định' : `${playbackRate}x`} ›</span>
          </div>

          {/* Subtitle Selector option */}
          {subtitles.length > 0 && (
            <div className="settings-menu-item" onClick={() => setCurrentMenu('subtitles')}>
              <span>Phụ đề</span>
              <span style={{ color: 'var(--text-muted)' }}>{getSubtitleLabel(activeSubtitleId)} ›</span>
            </div>
          )}
        </div>
      )}

      {/* Speed Submenu */}
      {currentMenu === 'speed' && (
        <div className="settings-submenu">
          <div className="settings-menu-header" onClick={() => setCurrentMenu('main')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="12" x2="6" y2="12" /><polyline points="12 6 6 12 12 18" />
            </svg>
            <span>Tốc độ phát</span>
          </div>
          
          {speeds.map(sp => (
            <div 
              key={sp} 
              className="settings-menu-item"
              onClick={() => {
                onPlaybackRateChange(sp);
                setCurrentMenu('main');
                onClose();
              }}
            >
              <span>{sp === 1 ? 'Mặc định (1x)' : `${sp}x`}</span>
              {playbackRate === sp && <span className="settings-menu-check">✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* Subtitles Submenu */}
      {currentMenu === 'subtitles' && (
        <div className="settings-submenu">
          <div className="settings-menu-header" onClick={() => setCurrentMenu('main')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="12" x2="6" y2="12" /><polyline points="12 6 6 12 12 18" />
            </svg>
            <span>Phụ đề</span>
          </div>

          {/* Off option */}
          <div 
            className="settings-menu-item"
            onClick={() => {
              onSubtitleChange(null);
              setCurrentMenu('main');
              onClose();
            }}
          >
            <span>Tắt</span>
            {activeSubtitleId === null && <span className="settings-menu-check">✓</span>}
          </div>

          {subtitles.map(sub => (
            <div 
              key={sub.id} 
              className="settings-menu-item"
              onClick={() => {
                onSubtitleChange(sub.id);
                setCurrentMenu('main');
                onClose();
              }}
            >
              <span>{sub.label}</span>
              {activeSubtitleId === sub.id && <span className="settings-menu-check">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
