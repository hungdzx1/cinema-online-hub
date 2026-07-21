import { useState, useEffect } from 'react';
import { episodeApi } from '../../services/episodeApi';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import './admin.css';

const formatDuration = (seconds) => {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const EpisodeManager = ({ movieId }) => {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEp, setEditingEp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ episodeNumber: '', title: '', embedUrl: '', durationSeconds: '' });
  const toast = useToast();

  const fetchEpisodes = async () => {
    try {
      setLoading(true);
      const data = await episodeApi.getByMovie(movieId);
      setEpisodes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load episodes:', err);
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEpisodes(); }, [movieId]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setForm({ episodeNumber: '', title: '', embedUrl: '', durationSeconds: '' });
    setShowForm(false);
    setEditingEp(null);
  };

  const openAddForm = () => {
    const nextEp = episodes.length > 0 ? Math.max(...episodes.map((e) => e.episodeNumber)) + 1 : 1;
    setForm({ episodeNumber: nextEp, title: '', embedUrl: '', durationSeconds: '' });
    setEditingEp(null);
    setShowForm(true);
  };

  const openEditForm = (ep) => {
    setForm({
      episodeNumber: ep.episodeNumber,
      title: ep.title || '',
      embedUrl: ep.embedUrl || '',
      durationSeconds: ep.durationSeconds || '',
    });
    setEditingEp(ep);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.embedUrl.trim()) {
      toast.warning('Link video không được để trống');
      return;
    }

    try {
      const payload = {
        movieId,
        episodeNumber: Number(form.episodeNumber) || 1,
        title: form.title.trim() || undefined,
        embedUrl: form.embedUrl.trim(),
        durationSeconds: Number(form.durationSeconds) || 0,
      };

      if (editingEp) {
        const { movieId: _, ...updatePayload } = payload;
        await episodeApi.update(editingEp.id, updatePayload);
        toast.success(`Đã cập nhật Tập ${payload.episodeNumber}`);
      } else {
        await episodeApi.create(payload);
        toast.success(`Đã thêm Tập ${payload.episodeNumber}`);
      }
      resetForm();
      fetchEpisodes();
    } catch (err) {
      toast.error('Lưu tập phim thất bại');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await episodeApi.delete(deleteTarget.id);
      toast.success(`Đã xóa Tập ${deleteTarget.episodeNumber}`);
      setDeleteTarget(null);
      fetchEpisodes();
    } catch {
      toast.error('Xóa tập thất bại');
    }
  };

  return (
    <div className="episode-section">
      <div className="episode-section-header">
        <h3 className="episode-section-title">📋 Danh sách tập ({episodes.length})</h3>
        <button className="admin-add-btn" onClick={openAddForm} style={{ padding: '8px 14px', fontSize: 13 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm tập
        </button>
      </div>

      {/* Episode List */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: 16, fontSize: 14 }}>Đang tải danh sách tập...</div>
      ) : (
        <div className="episode-list">
          {episodes.map((ep) => (
            <div key={ep.id} className="episode-item-wrapper">
              <div className={`episode-item ${editingEp?.id === ep.id ? 'is-editing' : ''}`}>
                <div className="episode-number">{ep.episodeNumber}</div>
                <div className="episode-info">
                  <div className="episode-title">{ep.title || `Tập ${ep.episodeNumber}`}</div>
                  <div className="episode-meta">
                    {formatDuration(ep.durationSeconds)} • {(ep.viewCount || 0).toLocaleString()} lượt xem
                  </div>
                </div>
                <div className="episode-actions">
                  <button
                    className={`admin-action-btn btn-edit ${editingEp?.id === ep.id ? 'active' : ''}`}
                    title={editingEp?.id === ep.id ? 'Hủy sửa' : 'Sửa'}
                    onClick={() => (editingEp?.id === ep.id ? resetForm() : openEditForm(ep))}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="admin-action-btn btn-delete" title="Xóa" onClick={() => setDeleteTarget(ep)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>

              {/* Box sửa tập phim xuất hiện NGAY BÊN DƯỚI tập cần sửa */}
              {showForm && editingEp?.id === ep.id && (
                <div className="episode-form-inline">
                  <div className="episode-form-inputs">
                    <input
                      type="number"
                      placeholder="Số tập"
                      value={form.episodeNumber}
                      onChange={(e) => setForm({ ...form, episodeNumber: e.target.value })}
                      min="1"
                    />
                    <input
                      placeholder="Tên tập (tùy chọn)"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                    <input
                      placeholder="Link video (embed URL) *"
                      value={form.embedUrl}
                      onChange={(e) => setForm({ ...form, embedUrl: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Thời lượng (s)"
                      value={form.durationSeconds}
                      onChange={(e) => setForm({ ...form, durationSeconds: e.target.value })}
                      min="0"
                    />
                  </div>
                  <div className="episode-form-actions">
                    <button className="episode-save-btn" onClick={handleSave}>Lưu</button>
                    <button className="episode-cancel-btn" onClick={resetForm}>Hủy</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Form thêm mới tập phim (khi không chọn sửa tập nào) */}
          {showForm && !editingEp && (
            <div className="episode-form-inline" style={{ marginTop: 12 }}>
              <div className="episode-form-inputs">
                <input
                  type="number"
                  placeholder="Số tập"
                  value={form.episodeNumber}
                  onChange={(e) => setForm({ ...form, episodeNumber: e.target.value })}
                  min="1"
                />
                <input
                  placeholder="Tên tập (tùy chọn)"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <input
                  placeholder="Link video (embed URL) *"
                  value={form.embedUrl}
                  onChange={(e) => setForm({ ...form, embedUrl: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Thời lượng (s)"
                  value={form.durationSeconds}
                  onChange={(e) => setForm({ ...form, durationSeconds: e.target.value })}
                  min="0"
                />
              </div>
              <div className="episode-form-actions">
                <button className="episode-save-btn" onClick={handleSave}>Lưu tập mới</button>
                <button className="episode-cancel-btn" onClick={resetForm}>Hủy</button>
              </div>
            </div>
          )}

          {episodes.length === 0 && !showForm && (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '12px 0' }}>
              Chưa có tập nào. Nhấn "Thêm tập" để bắt đầu.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa tập phim"
        message={`Bạn có chắc muốn xóa Tập ${deleteTarget?.episodeNumber}?`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
