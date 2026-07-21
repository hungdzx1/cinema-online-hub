import { useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { useWatchlist } from '../context/WatchlistContext';
import './watchlist.css';

const BookmarkHeaderIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const WatchlistPage = () => {
  const navigate = useNavigate();
  const { watchlist, loading, removeFromWatchlist } = useWatchlist();

  return (
    <MainLayout>
      <div className="container watchlist-page-container fade-in">
        {/* Header section */}
        <div className="watchlist-header">
          <div className="watchlist-title-group">
            <div className="watchlist-title-icon">
              <BookmarkHeaderIcon />
            </div>
            <h1 className="watchlist-title">Phim Theo Dõi</h1>
            <span className="watchlist-badge">{watchlist.length} phim</span>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="watchlist-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="watchlist-card skeleton-card" style={{ height: '320px' }}>
                <div className="skeleton-poster" style={{ height: '220px' }}></div>
                <div style={{ padding: '12px' }}>
                  <div className="skeleton-text" style={{ width: '80%', height: '18px', marginBottom: '8px' }}></div>
                  <div className="skeleton-text" style={{ width: '50%', height: '14px' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="watchlist-empty">
            <div className="watchlist-empty-icon">
              <BookmarkHeaderIcon />
            </div>
            <h3>Danh sách theo dõi trống</h3>
            <p>Bạn chưa lưu bộ phim nào vào danh sách theo dõi. Hãy khám phá những bộ phim hấp dẫn và nhấn "Theo dõi" để không bỏ lỡ!</p>
            <Link to="/" className="watchlist-explore-btn">
              Khám phá phim ngay →
            </Link>
          </div>
        ) : (
          <div className="watchlist-grid">
            {watchlist.map((item) => {
              const movie = item.movie || item;
              const movieId = item.movieId || movie.id;

              return (
                <div key={movieId} className="watchlist-card">
                  <button
                    className="watchlist-overlay-btn"
                    title="Bỏ theo dõi"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWatchlist(movieId);
                    }}
                  >
                    <TrashIcon />
                  </button>

                  <Link to={`/movie/${movie.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="watchlist-poster-wrapper">
                      <img
                        src={movie.posterUrl || 'https://placehold.co/300x450/141414/FFF'}
                        alt={movie.title}
                        className="watchlist-poster"
                        loading="lazy"
                      />
                      {movie.avgRating > 0 && (
                        <div className="movie-rating" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <StarIcon /> {movie.avgRating}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="watchlist-card-info">
                    <Link to={`/movie/${movie.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 className="watchlist-card-title text-truncate" title={movie.title}>
                        {movie.title}
                      </h3>
                    </Link>

                    <div className="watchlist-card-meta">
                      <span>{movie.releaseYear || '2026'}</span>
                      {movie.totalEpisodes ? (
                        <span>{movie.totalEpisodes} tập</span>
                      ) : (
                        <span>Phim lẻ</span>
                      )}
                    </div>

                    <button
                      className="watchlist-remove-btn"
                      onClick={() => removeFromWatchlist(movieId)}
                    >
                      <TrashIcon /> Bỏ theo dõi
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default WatchlistPage;
