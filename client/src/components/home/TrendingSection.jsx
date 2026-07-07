
import { MovieCard } from '../common/MovieCard';
import './home.css';

export const TrendingSection = ({ movies = [] }) => {
  return (
    <section className="trending-section">
      <div className="container">
        <h2 className="section-title">
          <span className="fire-icon">🔥</span> ĐANG THỊNH HÀNH
        </h2>
        <div className="trending-grid">
          {movies.slice(0, 5).map((movie, index) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              rank={index + 1} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};
