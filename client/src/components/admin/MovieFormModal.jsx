import { useState, useEffect } from 'react';
import { movieApi } from '../../services/movieApi';
import { EpisodeManager } from './EpisodeManager';
import { useToast } from '../../context/ToastContext';
import './admin.css';

const slugify = (str) =>
  str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');

const INITIAL_FORM = {
  title: '', slug: '', description: '', posterUrl: '', bannerUrl: '',
  type: 'phim_le', status: 'ongoing', releaseYear: new Date().getFullYear(),
  isFeatured: false, isVisible: true, scheduleDate: '',
};

export const MovieFormModal = ({ movie, onClose, onSaved }) => {
  const isEdit = !!movie;
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (movie) {
      setForm({
        title: movie.title || '',
        slug: movie.slug || '',
        description: movie.description || '',
        posterUrl: movie.posterUrl || '',
        bannerUrl: movie.bannerUrl || '',
        type: movie.type || 'phim_le',
        status: movie.status || 'ongoing',
        releaseYear: movie.releaseYear || new Date().getFullYear(),
        isFeatured: movie.isFeatured || false,
        isVisible: movie.isVisible !== false,
        scheduleDate: movie.scheduleDate ? movie.scheduleDate.slice(0, 10) : '',
      });
    }
  }, [movie]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from title
      if (field === 'title') {
        updated.slug = slugify(value);
      }
      return updated;
    });
    // Clear error
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Tiêu đề không được để trống';
    if (!form.type) errs.type = 'Chọn loại phim';
    if (form.releaseYear && (form.releaseYear < 1900 || form.releaseYear > 2100)) {
      errs.releaseYear = 'Năm phát hành không hợp lệ';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        posterUrl: form.posterUrl.trim() || undefined,
        bannerUrl: form.bannerUrl.trim() || undefined,
        type: form.type,
        status: form.status,
        releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
        isFeatured: form.isFeatured,
        isVisible: form.isVisible,
        scheduleDate: form.scheduleDate || undefined,
      };

      if (isEdit) {
        await movieApi.update(movie.id, payload);
        toast.success(`Đã cập nhật phim "${form.title}"`);
      } else {
        await movieApi.create(payload);
        toast.success(`Đã tạo phim "${form.title}"`);
      }
      onSaved();
    } catch (err) {
      toast.error(isEdit ? 'Cập nhật phim thất bại' : 'Tạo phim thất bại');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: isEdit ? 820 : 720 }}>
        {/* Header */}
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">{isEdit ? '✏️ Chỉnh sửa phim' : '➕ Thêm phim mới'}</h2>
          <button className="admin-modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="admin-modal-body">
          <div className="admin-form-grid">
            {/* Title */}
            <div className="admin-form-group">
              <label className="admin-form-label">Tiêu đề <span className="required">*</span></label>
              <input
                className={`admin-form-input ${errors.title ? 'error' : ''}`}
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Nhập tên phim"
              />
              {errors.title && <span className="admin-form-error">{errors.title}</span>}
            </div>

            {/* Slug */}
            <div className="admin-form-group">
              <label className="admin-form-label">Slug</label>
              <input className="admin-form-input" value={form.slug} readOnly style={{ opacity: 0.7 }} />
              <span className="admin-form-hint">Tự động tạo từ tiêu đề</span>
            </div>

            {/* Type */}
            <div className="admin-form-group">
              <label className="admin-form-label">Loại phim <span className="required">*</span></label>
              <select className={`admin-form-select ${errors.type ? 'error' : ''}`} value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
                <option value="phim_le">Phim lẻ</option>
                <option value="phim_bo">Phim bộ</option>
                <option value="hoat_hinh">Hoạt hình</option>
                <option value="anime">Anime</option>
              </select>
            </div>

            {/* Status */}
            <div className="admin-form-group">
              <label className="admin-form-label">Trạng thái</label>
              <select className="admin-form-select" value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
                <option value="ongoing">Đang chiếu</option>
                <option value="completed">Hoàn thành</option>
                <option value="upcoming">Sắp chiếu</option>
              </select>
            </div>

            {/* Release Year */}
            <div className="admin-form-group">
              <label className="admin-form-label">Năm phát hành</label>
              <input
                type="number"
                className={`admin-form-input ${errors.releaseYear ? 'error' : ''}`}
                value={form.releaseYear}
                onChange={(e) => handleChange('releaseYear', e.target.value)}
                min="1900" max="2100"
              />
              {errors.releaseYear && <span className="admin-form-error">{errors.releaseYear}</span>}
            </div>

            {/* Schedule Date */}
            <div className="admin-form-group">
              <label className="admin-form-label">Ngày chiếu</label>
              <input
                type="date"
                className="admin-form-input"
                value={form.scheduleDate}
                onChange={(e) => handleChange('scheduleDate', e.target.value)}
              />
            </div>

            {/* Featured Toggle */}
            <div className="admin-form-group">
              <label className="admin-form-label">Nổi bật</label>
              <div
                className={`admin-toggle ${form.isFeatured ? 'active' : ''}`}
                onClick={() => handleChange('isFeatured', !form.isFeatured)}
                style={{ cursor: 'pointer' }}
              />
            </div>

            {/* Visible Toggle */}
            <div className="admin-form-group">
              <label className="admin-form-label">Hiển thị</label>
              <div
                className={`admin-toggle ${form.isVisible ? 'active' : ''}`}
                onClick={() => handleChange('isVisible', !form.isVisible)}
                style={{ cursor: 'pointer' }}
              />
            </div>

            {/* Description */}
            <div className="admin-form-group full-width">
              <label className="admin-form-label">Mô tả</label>
              <textarea
                className="admin-form-textarea"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Nhập mô tả phim..."
                rows={4}
              />
            </div>

            {/* Poster URL + Preview */}
            <div className="admin-form-group">
              <label className="admin-form-label">Poster URL</label>
              <input
                className="admin-form-input"
                value={form.posterUrl}
                onChange={(e) => handleChange('posterUrl', e.target.value)}
                placeholder="https://example.com/poster.jpg"
              />
              <div className="admin-image-preview">
                {form.posterUrl ? (
                  <img src={form.posterUrl} alt="Poster preview" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <span className="placeholder-text">Chưa có poster</span>
                )}
              </div>
            </div>

            {/* Banner URL + Preview */}
            <div className="admin-form-group">
              <label className="admin-form-label">Banner URL</label>
              <input
                className="admin-form-input"
                value={form.bannerUrl}
                onChange={(e) => handleChange('bannerUrl', e.target.value)}
                placeholder="https://example.com/banner.jpg"
              />
              <div className="admin-image-preview">
                {form.bannerUrl ? (
                  <img src={form.bannerUrl} alt="Banner preview" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <span className="placeholder-text">Chưa có banner</span>
                )}
              </div>
            </div>
          </div>

          {/* Episode Manager (only in edit mode) */}
          {isEdit && movie?.id && (
            <EpisodeManager movieId={movie.id} />
          )}
        </div>

        {/* Footer */}
        <div className="admin-modal-footer">
          <button className="admin-btn-secondary" onClick={onClose}>Hủy</button>
          <button className="admin-btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo phim')}
          </button>
        </div>
      </div>
    </div>
  );
};
