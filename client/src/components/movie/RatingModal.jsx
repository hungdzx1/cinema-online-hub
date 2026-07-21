import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ratingApi } from '../../services/ratingApi';
import './rating.css';

const SCORE_LABELS = {
  10: '⭐ 10/10 - Tuyệt đỉnh',
  9: '⭐ 9/10 - Rất hay',
  8: '⭐ 8/10 - Hay',
  7: '⭐ 7/10 - Khá ổn',
  6: '⭐ 6/10 - Tạm được',
  5: '⭐ 5/10 - Trung bình',
  4: '⭐ 4/10 - Dưới trung bình',
  3: '⭐ 3/10 - Dở',
  2: '⭐ 2/10 - Tệ',
  1: '⭐ 1/10 - Rất tệ',
};

export const RatingModal = ({ isOpen, onClose, movie, onRatingSubmitted }) => {
  const { isLoggedIn } = useAuth();
  const [score, setScore] = useState(10);
  const [hoverScore, setHoverScore] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  // Fetch existing user rating on open
  useEffect(() => {
    if (isOpen && isLoggedIn && movie?.id) {
      const fetchUserRating = async () => {
        try {
          setLoading(true);
          const data = await ratingApi.getUserRating(movie.id);
          if (data) {
            setExistingRating(data);
            setScore(data.score || 10);
            setContent(data.content || '');
          } else {
            setExistingRating(null);
            setScore(10);
            setContent('');
          }
        } catch (err) {
          console.error("Failed to load user rating:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchUserRating();
    }
  }, [isOpen, isLoggedIn, movie?.id]);

  if (!isOpen || !movie) return null;

  const currentDisplayScore = hoverScore || score;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để đánh giá bộ phim này!");
      return;
    }

    try {
      setSubmitting(true);
      await ratingApi.rateMovie({
        movieId: movie.id,
        score,
        content: content.trim() || undefined,
      });

      if (onRatingSubmitted) {
        onRatingSubmitted({ userScore: score });
      }
      onClose();
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingRating) return;
    try {
      setSubmitting(true);
      await ratingApi.deleteRating(movie.id);
      setExistingRating(null);
      setScore(10);
      setContent('');
      if (onRatingSubmitted) {
        onRatingSubmitted({ userScore: null });
      }
      onClose();
    } catch (err) {
      console.error("Error deleting rating:", err);
      alert("Đã xảy ra lỗi khi xóa đánh giá.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="rating-modal-close" onClick={onClose} aria-label="Đóng">
          ✕
        </button>

        <div className="rating-modal-header">
          <h2 className="rating-modal-title">Đánh giá phim</h2>
          <p className="rating-modal-subtitle">{movie.title}</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
            Đang tải thông tin đánh giá...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="rating-stars-container">
              <div className="rating-score-badge">
                {SCORE_LABELS[currentDisplayScore] || `${currentDisplayScore}/10`}
              </div>

              <div className="rating-stars-row">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const starVal = idx + 1;
                  const isActive = starVal <= score;
                  const isHovered = hoverScore > 0 && starVal <= hoverScore;

                  return (
                    <button
                      key={starVal}
                      type="button"
                      className={`star-btn ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                      onMouseEnter={() => setHoverScore(starVal)}
                      onMouseLeave={() => setHoverScore(0)}
                      onClick={() => setScore(starVal)}
                      title={`${starVal}/10`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              className="rating-textarea"
              placeholder="Chia sẻ nhận xét của bạn về bộ phim này (tùy chọn)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
            />

            <div className="rating-modal-actions">
              {existingRating && (
                <button
                  type="button"
                  className="rating-delete-btn"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  Xóa đánh giá
                </button>
              )}

              <button
                type="submit"
                className="rating-submit-btn"
                disabled={submitting}
              >
                {submitting
                  ? 'Đang gửi...'
                  : existingRating
                  ? 'Cập nhật đánh giá'
                  : 'Gửi đánh giá'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
