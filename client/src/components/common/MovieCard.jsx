import { Link } from 'react-router-dom';
import './common.css';

export const MovieCard = ({ movie, rank }) => {
  // Lấy danh sách tên thể loại ghép lại bằng dấu chấm (•)
  const genresText = movie.genres?.map(g => g.name).join(' • ') || 'Đang cập nhật';

  return (
    <Link to={`/movie/${movie.slug}`} className="movie-card" style={{ textDecoration: 'none' }}>
      <div className="movie-poster-wrapper">
        <img 
          src={movie.posterUrl || 'https://placehold.co/300x450/141414/FFF'} 
          alt={movie.title} 
          className="movie-poster"
          loading="lazy"
        />
        {movie.avgRating && (
          <div className="movie-rating">
            {movie.avgRating}
          </div>
        )}
      </div>
      
      <div className="movie-info-block">
        {rank && <div className="movie-rank">{rank}</div>}
        
        <div className="movie-titles">
          <h3 className="movie-title text-truncate" title={movie.title}>
            {movie.title}
          </h3>
          <p className="movie-subtitle text-truncate">
            {movie.releaseYear ? movie.releaseYear : ''} {movie.releaseYear ? '• ' : ''}{movie.type === 'phim_bo' ? 'Phim Bộ' : 'Phim Lẻ'}
          </p>
        </div>
      </div>

      {/* ===== KHỐI QUICK VIEW (HIỆN KHI HOVER) ===== */}
      <div className="movie-quick-view">
        <h4 className="qv-title">{movie.title}</h4>
        <div className="qv-meta">
          <span className="qv-badge">HD</span>
          <span>{movie.releaseYear || 'N/A'}</span>
          <span className="qv-dot">•</span>
          <span>{movie.type === 'phim_bo' ? 'Phim Bộ' : 'Phim Lẻ'}</span>
        </div>
        <p className="qv-genres">{genresText}</p>
        <p className="qv-desc">
          {movie.description ? `${movie.description.substring(0, 100)}...` : 'Chưa có mô tả cho bộ phim này.'}
        </p>
        <div className="qv-btn">Xem chi tiết ➜</div>
      </div>
    </Link>
  );
};