import { useRef, useState, useEffect } from 'react';
import { MovieCard } from '../common/MovieCard';
import './home.css';

export const TrendingCarousel = ({ movies = [] }) => {
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Drag to scroll logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  // Button scroll logic
  const scroll = (direction) => {
    const scrollAmount = direction === 'left' ? -300 : 300;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Horizontal wheel scroll logic
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleWheel = (e) => {
      // Allow vertical scroll if scrolling vertically, but if we hover and scroll, we might want to convert it to horizontal.
      // Usually users expect horizontal scroll if the area is horizontally scrollable.
      // But standard behavior is just let horizontal wheel events scroll it.
      if (e.deltaX !== 0) {
        // Horizontal scroll, let it be
      } else if (e.deltaY !== 0 && !e.shiftKey) {
        // Optional: Convert vertical scroll to horizontal scroll when hovering over the carousel
        // This might interfere with normal page scrolling, so we only do it if the user isn't holding Shift
        // e.preventDefault();
        // carousel.scrollLeft += e.deltaY;
      }
    };

    carousel.addEventListener('wheel', handleWheel, { passive: false });
    return () => carousel.removeEventListener('wheel', handleWheel);
  }, []);

  if (!movies || movies.length === 0) return null;

  return (
    <section className="trending-section">
      <div className="container">
        <h2 className="section-title">
          <span className="fire-icon">🔥</span> ĐANG THỊNH HÀNH
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
                  rank={index + 1} 
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
      </div>
    </section>
  );
};
