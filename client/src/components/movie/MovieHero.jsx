import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWatchlist } from '../../context/WatchlistContext';
import { useAuth } from '../../context/AuthContext';
import { ratingApi } from '../../services/ratingApi';
import { movieApi } from '../../services/movieApi';
import { RatingModal } from './RatingModal';
import './detail.css';

export const MovieHero = ({ movie, episodesCount = 0 }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [userScore, setUserScore] = useState(null);
  const [currentMovie, setCurrentMovie] = useState(movie);

  useEffect(() => {
    setCurrentMovie(movie);
  }, [movie]);

  useEffect(() => {
    if (isLoggedIn && movie?.id) {
      ratingApi.getUserRating(movie.id)
        .then(res => {
          if (res?.score) setUserScore(res.score);
          else setUserScore(null);
        })
        .catch(() => setUserScore(null));
    } else {
      setUserScore(null);
    }
  }, [isLoggedIn, movie?.id]);

  if (!currentMovie) return null;

  const isFollowing = isInWatchlist(currentMovie.id);

  const handleToggleFollow = (e) => {
    e.preventDefault();
    toggleWatchlist(currentMovie);
  };

  const handleOpenRating = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmitted = async ({ userScore: newScore }) => {
    setUserScore(newScore);
    // Refetch movie details to get fresh avgRating and ratingCount from DB
    try {
      const res = await movieApi.getDetailBySlug(currentMovie.slug);
      if (res?.movie) {
        setCurrentMovie(res.movie);
      }
    } catch (e) {
      console.error("Failed to refresh movie stats:", e);
    }
  };

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
    <>
      <div 
        className="movie-detail-banner"
        style={{ backgroundImage: currentMovie.bannerUrl ? `url(${currentMovie.bannerUrl})` : 'none' }}
      >
        <div className="container">
          <div className="movie-detail-hero-content">
            {/* Left Poster */}
            <div className="movie-detail-poster-wrapper">
              <img 
                src={currentMovie.posterUrl || 'https://placehold.co/300x450/141414/FFF'} 
                alt={currentMovie.title}
                className="movie-detail-poster" 
              />
            </div>

            {/* Right Meta details */}
            <div className="movie-detail-meta">
              <h1 className="movie-detail-title">{currentMovie.title}</h1>
              {currentMovie.description && (
                <p className="movie-detail-original-title">{currentMovie.title} (Original)</p>
              )}

              <div className="movie-meta-tags">
                <span className="meta-tag primary-tag">{getTypeText(currentMovie.type)}</span>
                <span className="meta-tag warning-tag">★ {currentMovie.avgRating || 'N/A'}</span>
                <span className="meta-tag">{getStatusText(currentMovie.status)}</span>
                {currentMovie.releaseYear && <span className="meta-tag">{currentMovie.releaseYear}</span>}
              </div>

              <div className="movie-meta-info-grid">
                <div className="movie-meta-info-item">
                  <span className="movie-meta-info-label">Tổng số tập:</span>
                  <span className="movie-meta-info-value">{currentMovie.totalEpisodes || 'N/A'} tập</span>
                </div>
                <div className="movie-meta-info-item">
                  <span className="movie-meta-info-label">Lượt xem:</span>
                  <span className="movie-meta-info-value">{(currentMovie.viewCount || 0).toLocaleString()}</span>
                </div>
                <div className="movie-meta-info-item">
                  <span className="movie-meta-info-label">Đánh giá:</span>
                  <span className="movie-meta-info-value">{(currentMovie.ratingCount || 0).toLocaleString()} lượt</span>
                </div>
              </div>

              <div className="movie-hero-actions">
                <Link 
                  to={`/movie/${currentMovie.slug}/watch?episode=1`}
                  className="hero-btn hero-btn-play"
                >
                  ▶ Xem phim
                </Link>
                <button 
                  className={`hero-btn ${userScore ? 'hero-btn-following' : 'hero-btn-secondary'}`}
                  onClick={handleOpenRating}
                >
                  {userScore ? `⭐ Bạn: ${userScore}/10` : '⭐ Đánh giá'}
                </button>
                <button 
                  className={`hero-btn ${isFollowing ? 'hero-btn-following' : 'hero-btn-secondary'}`} 
                  onClick={handleToggleFollow}
                >
                  {isFollowing ? '❤️ Đang theo dõi' : '❤️ Theo dõi'}
                </button>
                <button className="hero-btn hero-btn-secondary" onClick={handleScrollToComments}>
                  💬 Bình luận
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        movie={currentMovie}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </>
  );
};
