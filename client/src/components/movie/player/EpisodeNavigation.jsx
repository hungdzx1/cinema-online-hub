import './player.css';

export const EpisodeNavigation = ({ 
  currentEpisodeNumber, 
  totalEpisodes = 1, 
  onSelectEpisode 
}) => {
  const isFirst = currentEpisodeNumber <= 1;
  const isLast = currentEpisodeNumber >= totalEpisodes;

  return (
    <div className="episode-nav-container">
      <button 
        className="episode-nav-btn"
        disabled={isFirst}
        onClick={() => onSelectEpisode(currentEpisodeNumber - 1)}
      >
        ◀ Tập trước
      </button>

      <span className="episode-nav-center">
        Tập {currentEpisodeNumber} / {totalEpisodes}
      </span>

      <button 
        className="episode-nav-btn"
        disabled={isLast}
        onClick={() => onSelectEpisode(currentEpisodeNumber + 1)}
      >
        Tập sau ▶
      </button>
    </div>
  );
};
