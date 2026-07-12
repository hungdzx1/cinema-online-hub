import './detail.css';

export const MovieInfo = ({ movie }) => {
  if (!movie) return null;

  const genresList = movie.genres?.map(g => g.name).join(', ');
  const countriesList = movie.countries?.map(c => c.name).join(', ');

  return (
    <div className="movie-specs-card">
      <h2 className="movie-specs-title">Thông tin phim</h2>
      {movie.description && (
        <p className="movie-description-text">{movie.description}</p>
      )}

      <div className="movie-specs-list">
        {genresList && (
          <div className="movie-spec-item">
            <span className="movie-spec-label">Thể loại</span>
            <span className="movie-spec-value">{genresList}</span>
          </div>
        )}
        {countriesList && (
          <div className="movie-spec-item">
            <span className="movie-spec-label">Quốc gia</span>
            <span className="movie-spec-value">{countriesList}</span>
          </div>
        )}
        {movie.director && (
          <div className="movie-spec-item">
            <span className="movie-spec-label">Đạo diễn</span>
            <span className="movie-spec-value">{movie.director}</span>
          </div>
        )}
        {movie.cast && (
          <div className="movie-spec-item">
            <span className="movie-spec-label">Diễn viên</span>
            <span className="movie-spec-value">{movie.cast}</span>
          </div>
        )}
        {movie.studio && (
          <div className="movie-spec-item">
            <span className="movie-spec-label">Studio</span>
            <span className="movie-spec-value">{movie.studio}</span>
          </div>
        )}
        {movie.duration && (
          <div className="movie-spec-item">
            <span className="movie-spec-label">Thời lượng</span>
            <span className="movie-spec-value">{movie.duration} phút</span>
          </div>
        )}
        {movie.language && (
          <div className="movie-spec-item">
            <span className="movie-spec-label">Ngôn ngữ</span>
            <span className="movie-spec-value">{movie.language}</span>
          </div>
        )}
        {movie.releaseYear && (
          <div className="movie-spec-item">
            <span className="movie-spec-label">Năm phát hành</span>
            <span className="movie-spec-value">{movie.releaseYear}</span>
          </div>
        )}
      </div>
    </div>
  );
};
