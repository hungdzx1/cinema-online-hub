import { MovieCard } from '../common/MovieCard';
import { Pagination } from '../common/Pagination';
import './home.css';

export const MovieGrid = ({ 
  movies = [], 
  loading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange 
}) => {
  return (
    <section className="movie-grid-section">
      <div className="container">
        <div className={`movie-grid-wrapper ${loading ? 'loading' : ''}`}>
          {loading ? (
            <div className="movie-grid">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="movie-card skeleton-card">
                  <div className="skeleton-poster"></div>
                  <div className="skeleton-text title"></div>
                  <div className="skeleton-text subtitle"></div>
                </div>
              ))}
            </div>
          ) : movies.length > 0 ? (
            <>
              <div className="movie-grid fade-in">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              
              {/* Phân trang */}
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </>
          ) : (
            <div className="empty-state fade-in">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="2" y1="7" x2="7" y2="7"></line>
                <line x1="2" y1="17" x2="7" y2="17"></line>
                <line x1="17" y1="17" x2="22" y2="17"></line>
                <line x1="17" y1="7" x2="22" y2="7"></line>
              </svg>
              <h3>Không có phim nào</h3>
              <p>Thể loại này hiện chưa có phim, vui lòng thử lại sau.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

