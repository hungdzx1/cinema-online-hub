import { useState, useMemo } from 'react';
import './detail.css';

export const EpisodeGrid = ({ 
  episodes = [], 
  activeEpisodeNumber = 1, 
  onSelectEpisode,
  movieType = 'phim_bo'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(0);
  const EPISODES_PER_PAGE = 50;

  // Single movie vs series
  const displayEpisodes = useMemo(() => {
    if (movieType === 'phim_le') {
      return episodes.length > 0 ? [episodes[0]] : [{ episodeNumber: 1, title: 'Full' }];
    }
    return episodes;
  }, [episodes, movieType]);

  // Filter based on search query
  const filteredEpisodes = useMemo(() => {
    if (!searchQuery.trim()) return displayEpisodes;
    const queryNum = parseInt(searchQuery, 10);
    return displayEpisodes.filter(ep => {
      if (!isNaN(queryNum)) {
        return ep.episodeNumber === queryNum;
      }
      return ep.title?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [displayEpisodes, searchQuery]);

  // Pagination group calculation for series with large episode counts (>50)
  const paginatedEpisodes = useMemo(() => {
    if (movieType === 'phim_le' || filteredEpisodes.length <= EPISODES_PER_PAGE) {
      return filteredEpisodes;
    }
    const start = activePage * EPISODES_PER_PAGE;
    return filteredEpisodes.slice(start, start + EPISODES_PER_PAGE);
  }, [filteredEpisodes, activePage, movieType]);

  const pageCount = Math.ceil(filteredEpisodes.length / EPISODES_PER_PAGE);

  if (episodes.length === 0 && movieType !== 'phim_le') {
    return (
      <div className="episodes-card">
        <h2 className="movie-specs-title">Danh sách tập</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Chưa có tập phim nào được cập nhật.</p>
      </div>
    );
  }

  return (
    <div className="episodes-card">
      <div className="episodes-header-block">
        <h2 className="movie-specs-title" style={{ marginBottom: 0 }}>Danh sách tập</h2>
        
        {/* Search bar displayed for large episode counts */}
        {displayEpisodes.length > 30 && (
          <div className="episode-search-wrapper">
            <input 
              type="text" 
              placeholder="Nhập số tập phim..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActivePage(0); // Reset page on query
              }}
              className="episode-search-input"
            />
          </div>
        )}
      </div>

      {/* Episode Button Grid */}
      <div className="episode-btn-grid">
        {paginatedEpisodes.map(ep => (
          <button
            key={ep.episodeNumber}
            className={`episode-btn ${activeEpisodeNumber === ep.episodeNumber ? 'active' : ''}`}
            onClick={() => onSelectEpisode(ep.episodeNumber)}
          >
            {ep.episodeNumber}
          </button>
        ))}
      </div>

      {/* Pagination tabs for large episode listings */}
      {pageCount > 1 && !searchQuery && (
        <div className="episode-pagination">
          {Array.from({ length: pageCount }).map((_, idx) => {
            const startRange = idx * EPISODES_PER_PAGE + 1;
            const endRange = Math.min((idx + 1) * EPISODES_PER_PAGE, filteredEpisodes.length);
            return (
              <button
                key={idx}
                className={`pagination-btn ${activePage === idx ? 'active' : ''}`}
                onClick={() => setActivePage(idx)}
                style={{ fontSize: '12px', padding: '0 10px', height: '32px' }}
              >
                {startRange}-{endRange}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
