import { MovieCard } from '../common/MovieCard';
import './detail.css';

export const RelatedMovies = ({ movies = [] }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="related-movies-card">
      <h2 className="movie-specs-title">Phim liên quan</h2>
      <div className="related-grid">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};
