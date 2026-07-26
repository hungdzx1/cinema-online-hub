import './player.css';
import { ErrorReportModal } from '../ErrorReportModal';

export const EpisodeNavigation = ({
  currentEpisodeNumber,
  totalEpisodes = 1,
  onSelectEpisode,
  movieId,
  episodeId,
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

      <div className="episode-nav-right-group">
        <button
          className="episode-nav-btn"
          disabled={isLast}
          onClick={() => onSelectEpisode(currentEpisodeNumber + 1)}
        >
          Tập sau ▶
        </button>

        <ErrorReportModal movieId={movieId} episodeId={episodeId} />
      </div>
    </div>
  );
};

export default EpisodeNavigation;