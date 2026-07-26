import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { errorReportApi, ERROR_TYPES } from '../../services/errorReportApi';
import './error-report.css';

export const ErrorReportModal = ({ movieId, episodeId }) => {
  const [open, setOpen] = useState(false);
  const [errorType, setErrorType] = useState('video_not_load');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Đóng modal bằng phím Esc + khoá scroll body khi mở
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleOpen = () => {
    if (!isLoggedIn) {
      toast.warning('Bạn cần đăng nhập để báo lỗi.');
      navigate('/login');
      return;
    }
    if (!movieId) {
      toast.error('Không xác định được phim để báo lỗi.');
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    if (submitting) return;
    setOpen(false);
    setErrorType('video_not_load');
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!movieId) {
      toast.error('Thiếu thông tin phim.');
      return;
    }
    setSubmitting(true);
    try {
      await errorReportApi.create({
        movieId,
        episodeId: episodeId || undefined,
        errorType,
        description: description.trim() || undefined,
      });
      toast.success('Đã gửi báo lỗi. Admin sẽ kiểm tra sớm!');
      handleClose();
    } catch (err) {
      console.error('Submit error report failed:', err);
      const msg =
        err?.response?.data?.message ||
        'Gửi báo lỗi thất bại. Vui lòng thử lại.';
      toast.error(typeof msg === 'string' ? msg : 'Gửi báo lỗi thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="error-report-trigger"
        onClick={handleOpen}
        title="Báo lỗi tập phim này"
        aria-label="Báo lỗi"
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
        <span>Báo lỗi</span>
      </button>

      {open && (
        <div className="error-report-overlay" onClick={handleClose}>
          <div
            className="error-report-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="error-report-header">
              <h3>🚩 Báo lỗi phim</h3>
              <button
                type="button"
                className="error-report-close"
                onClick={handleClose}
                disabled={submitting}
                aria-label="Đóng"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form className="error-report-body" onSubmit={handleSubmit}>
              <label className="error-report-label">Chọn loại lỗi</label>
              <div className="error-report-type-grid">
                {ERROR_TYPES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    className={`error-report-type-card ${errorType === t.value ? 'active' : ''}`}
                    onClick={() => setErrorType(t.value)}
                    disabled={submitting}
                  >
                    <span className="error-report-type-icon">{t.icon}</span>
                    <span className="error-report-type-label">{t.label}</span>
                  </button>
                ))}
              </div>

              <label className="error-report-label" htmlFor="error-desc">
                Mô tả chi tiết{' '}
                <span className="error-report-optional">(không bắt buộc)</span>
              </label>
              <textarea
                id="error-desc"
                className="error-report-textarea"
                placeholder="VD: Tập 5 bị lỗi hình từ phút 10, hoặc phụ đề bị lệch..."
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                rows={4}
              />
              <div className="error-report-counter">
                {description.length}/500
              </div>

              <div className="error-report-actions">
                <button
                  type="button"
                  className="error-report-btn error-report-btn-cancel"
                  onClick={handleClose}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="error-report-btn error-report-btn-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="error-report-spinner" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi báo lỗi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ErrorReportModal;
