
import './common.css';

export const MovieCard = ({ movie, rank }) => {
  return (
    <div className="movie-card">
      <div className="movie-poster-wrapper">
        <img 
          src={movie.posterUrl || 'https://placehold.co/300x450/141414/FFF'} 
          alt={movie.title} 
          className="movie-poster"
          loading="lazy"
        />
        {/* Điểm đánh giá góc dưới phải poster */}
        {movie.avgRating && (
          <div className="movie-rating">
            {movie.avgRating}
          </div>
        )}
      </div>
      
      <div className="movie-info-block">
        {/* Hiển thị Rank nếu có truyền vào (top trending) */}
        {rank && <div className="movie-rank">{rank}</div>}
        
        <div className="movie-titles">
          <h3 className="movie-title text-truncate" title={movie.title}>
            {movie.title}
          </h3>
          <p className="movie-subtitle text-truncate" title={movie.description}>
            {movie.description || 'Subtitle'}
          </p>
        </div>
      </div>
    </div>
  );
};
