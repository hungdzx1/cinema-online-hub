import { Link, useNavigate } from 'react-router-dom';
import './detail.css';

export const MovieHero = ({ movie, episodesCount = 0 }) => {
  const navigate = useNavigate();

  if (!movie) return null;

  const handleScrollToComments = () => {
    const commentsSec = document.querySelector('.comments-card');
    if (commentsSec) {
      commentsSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ongoing': return 'Đang phát sóng';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'phim_bo': return 'Phim Bộ';
      case 'phim_le': return 'Phim Lẻ';
      case 'hoat_hinh': return 'Hoạt Hình';
      case 'anime': return 'Anime';
      default: return type;
    }
  };

  return (
    <div 
      className="movie-detail-banner"
      style={{ backgroundImage: movie.bannerUrl ? `url(${movie.bannerUrl})` : 'none' }}
    >
      <div className="container">
        <div className="movie-detail-hero-content">
          {/* Left Poster */}
          <div className="movie-detail-poster-wrapper">
            <img 
              src={movie.posterUrl || 'https://placehold.co/300x450/141414/FFF'} 
              alt={movie.title}
              className="movie-detail-poster" 
            />
          </div>

          {/* Right Meta details */}
          <div className="movie-detail-meta">
            <h1 className="movie-detail-title">{movie.title}</h1>
            {movie.description && (
              <p className="movie-detail-original-title">{movie.title} (Original)</p>
            )}

            <div className="movie-meta-tags">
              <span className="meta-tag primary-tag">{getTypeText(movie.type)}</span>
              <span className="meta-tag warning-tag">★ {movie.avgRating || 'N/A'}</span>
              <span className="meta-tag">{getStatusText(movie.status)}</span>
              {movie.releaseYear && <span className="meta-tag">{movie.releaseYear}</span>}
            </div>

            <div className="movie-meta-info-grid">
              <div className="movie-meta-info-item">
                <span className="movie-meta-info-label">Tổng số tập:</span>
                <span className="movie-meta-info-value">{movie.totalEpisodes || 'N/A'} tập</span>
              </div>
              <div className="movie-meta-info-item">
                <span className="movie-meta-info-label">Lượt xem:</span>
                <span className="movie-meta-info-value">{(movie.viewCount || 0).toLocaleString()}</span>
              </div>
              <div className="movie-meta-info-item">
                <span className="movie-meta-info-label">Đánh giá:</span>
                <span className="movie-meta-info-value">{(movie.ratingCount || 0).toLocaleString()} lượt</span>
              </div>
            </div>

            <div className="movie-hero-actions">
              <Link 
                to={`/movie/${movie.slug}/watch?episode=1`}
                className="hero-btn hero-btn-play"
              >
                ▶ Xem phim
              </Link>
              <button className="hero-btn hero-btn-secondary" onClick={() => alert('Chức năng đánh giá sẽ sớm được cập nhật!')}>
                ⭐ Đánh giá
              </button>
              <button className="hero-btn hero-btn-secondary" onClick={() => alert('Đã thêm phim vào danh sách theo dõi!')}>
                ❤️ Theo dõi
              </button>
              <button className="hero-btn hero-btn-secondary" onClick={handleScrollToComments}>
                💬 Bình luận
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
