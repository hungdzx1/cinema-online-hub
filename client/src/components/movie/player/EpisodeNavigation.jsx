import './player.css';
import { ErrorReportModal } from '../ErrorReportModal';

/**
 * Thanh điều khiển phía dưới VideoPlayer.
 *
 * Props:
 *  - currentEpisodeNumber: số tập hiện tại
 *  - totalEpisodes:        tổng số tập của server đang chọn
 *  - onSelectEpisode:      callback khi bấm "Tập trước" / "Tập sau"
 *  - movieId / episodeId:  cho ErrorReportModal
 *  - servers:              mảng tên server, vd. ['Server 1', 'Server 2']
 *  - activeServer:         tên server đang chọn
 *  - onSelectServer:       callback khi bấm chip server
 *  - serverEpisodeCounts:  object map { 'Server 1': 12, 'Server 2': 5 }
 *  - currentEpisodeAvailable: bool — tập hiện tại có tồn tại ở activeServer không
 */
export const EpisodeNavigation = ({
  currentEpisodeNumber,
  totalEpisodes = 1,
  onSelectEpisode,
  movieId,
  episodeId,
  servers = [],
  activeServer = '',
  onSelectServer,
  serverEpisodeCounts = {},
  currentEpisodeAvailable = true,
}) => {
  const isFirst = currentEpisodeNumber <= 1;
  const isLast = currentEpisodeNumber >= totalEpisodes;
  const hasMultipleServers = servers.length > 1;

  // Helper: server này có tập hiện tại không?
  // (Chỉ dùng khi có nhiều server, để hiện badge "missing" nếu thiếu)
  const serverHasCurrentEp = (serverName) => {
    // Nếu không có thông tin count → giả định có
    if (!serverEpisodeCounts[serverName]) return true;
    // Chúng ta không biết chính xác server kia có tập X không,
    // nên chỉ hiện badge "missing" khi server có 0 tập.
    return serverEpisodeCounts[serverName] > 0;
  };

  return (
    <div className="episode-nav-container">
      {/* ===== LEFT: Tập trước ===== */}
      <button
        className="episode-nav-btn"
        disabled={isFirst}
        onClick={() => onSelectEpisode(currentEpisodeNumber - 1)}
      >
        ◀ Tập trước
      </button>

      {/* ===== CENTER: Tập hiện tại + Server chips ===== */}
      <div className="episode-nav-center-group">
        <span className="episode-nav-center">
          Tập {currentEpisodeNumber} / {totalEpisodes}
          {!currentEpisodeAvailable && (
            <span className="episode-nav-missing-tag" title="Tập này không có trên server hiện tại">
              ⚠
            </span>
          )}
        </span>

        {hasMultipleServers && (
          <div className="server-chip-group" role="group" aria-label="Chọn server xem phim">
            <span className="server-chip-label">Server:</span>
            <div className="server-chip-list">
              {servers.map((serverName) => {
                const isActive = serverName === activeServer;
                const count = serverEpisodeCounts[serverName] || 0;
                const hasEp = serverHasCurrentEp(serverName);
                return (
                  <button
                    key={serverName}
                    type="button"
                    className={`server-chip${isActive ? ' active' : ''}${!hasEp ? ' empty' : ''}`}
                    onClick={() => onSelectServer?.(serverName)}
                    title={
                      hasEp
                        ? `${serverName} — ${count} tập`
                        : `${serverName} — chưa có tập phim`
                    }
                    aria-pressed={isActive}
                  >
                    <span className="server-chip-name">{serverName}</span>
                    {hasEp && count > 0 && (
                      <span className="server-chip-count">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== RIGHT: Tập sau + Báo lỗi ===== */}
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