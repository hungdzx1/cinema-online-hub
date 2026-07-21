import { useRef, useState } from 'react';
import { MovieCard } from '../common/MovieCard';
import './home.css';

export const TrendingCarousel = ({ title = '🔥 ĐANG THỊNH HÀNH', movies = [], showRank = false }) => {
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const scroll = (direction) => {
    const scrollAmount = direction === 'left' ? -300 : 300;
    carouselRef.current?.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="trending-section" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
      <h2 className="section-title">
        {title}
      </h2>
      
      <div className="trending-carousel-wrapper">
        <button 
          className="carousel-btn left" 
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          &#8249;
        </button>
        
        <div 
          className={`trending-carousel ${isDragging ? 'dragging' : ''}`}
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {movies.map((movie, index) => (
            <div key={movie.id} className="carousel-item">
              <MovieCard 
                movie={movie} 
                rank={showRank ? index + 1 : null} 
              />
            </div>
          ))}
        </div>

        <button 
          className="carousel-btn right" 
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          &#8250;
        </button>
      </div>
    </section>
  );
};