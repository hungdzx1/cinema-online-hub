import { useState } from 'react';
import './home.css';

export const CategoryFilter = ({ genres = [], activeCategorySlug, onSelectCategory }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_COUNT = 8;
  const showToggle = genres.length > INITIAL_COUNT;

  const visibleGenres = isExpanded ? genres : genres.slice(0, INITIAL_COUNT);

  return (
    <section className="category-filter-section">
      <div className="container">
        <div className={`category-tabs-container ${isExpanded ? 'expanded' : ''}`}>
          <button
            className={`category-tab ${!activeCategorySlug ? 'active' : ''}`}
            onClick={() => onSelectCategory(null)}
          >
            Tất cả
          </button>
          
          {visibleGenres.map(genre => (
            <button
              key={genre.id}
              className={`category-tab ${activeCategorySlug === genre.slug ? 'active' : ''}`}
              onClick={() => onSelectCategory(genre)}
            >
              {genre.name}
            </button>
          ))}
          
          {showToggle && (
            <button 
              className="category-tab category-toggle-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Thu gọn ▲' : '+ Xem thêm ▼'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

