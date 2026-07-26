import { useState, useEffect, useMemo } from 'react';
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

const DEFAULT_SERVER = 'Server 1';

// Lấy tên server từ episode (fallback nếu null/empty)
const getServerName = (ep) => {
  const name = (ep?.serverName || '').trim();
  return name || DEFAULT_SERVER;
};

const EMPTY_FORM = {
  episodeNumber: '',
  title: '',
  embedUrl: '',
  durationSeconds: '',
  serverName: DEFAULT_SERVER,
};

export const EpisodeManager = ({ movieId }) => {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEp, setEditingEp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [collapsedServers, setCollapsedServers] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);
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

  // Tự động tính danh sách server hiện có trong DB cho phim này
  const serverOptions = useMemo(() => {
    const seen = new Set();
    const ordered = [];
    episodes.forEach((ep) => {
      const name = getServerName(ep);
      if (!seen.has(name)) {
        seen.add(name);
        ordered.push(name);
      }
    });
    // Đảm bảo luôn có 'Server 1' và 'Server 2' trong dropdown
    if (!seen.has(DEFAULT_SERVER)) ordered.push(DEFAULT_SERVER);
    if (!seen.has('Server 2')) ordered.push('Server 2');
    return ordered;
  }, [episodes]);

  // Nhóm episodes theo server để render
  const episodesByServer = useMemo(() => {
    const map = {};
    episodes.forEach((ep) => {
      const name = getServerName(ep);
      if (!map[name]) map[name] = [];
      map[name].push(ep);
    });
    // Sắp xếp mỗi nhóm theo episodeNumber
    Object.values(map).forEach((list) =>
      list.sort((a, b) => a.episodeNumber - b.episodeNumber),
    );
    return map;
  }, [episodes]);

  // Danh sách server theo thứ tự xuất hiện (giữ thứ tự tự nhiên)
  const serverNamesOrdered = useMemo(() => {
    const seen = new Set();
    const ordered = [];
    episodes.forEach((ep) => {
      const name = getServerName(ep);
      if (!seen.has(name)) {
        seen.add(name);
        ordered.push(name);
      }
    });
    return ordered;
  }, [episodes]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingEp(null);
  };

  const openAddForm = () => {
    // Mặc định gợi ý số tập tiếp theo của server đang chọn (hoặc Server 1)
    const currentServer = form.serverName || DEFAULT_SERVER;
    const list = episodesByServer[currentServer] || [];
    const nextEp = list.length > 0
      ? Math.max(...list.map((e) => e.episodeNumber)) + 1
      : 1;
    setForm({
      ...EMPTY_FORM,
      serverName: currentServer,
      episodeNumber: nextEp,
    });
    setEditingEp(null);
    setShowForm(true);
  };

  const openEditForm = (ep) => {
    setForm({
      episodeNumber: ep.episodeNumber,
      title: ep.title || '',
      embedUrl: ep.embedUrl || '',
      durationSeconds: ep.durationSeconds || '',
      serverName: getServerName(ep),
    });
    setEditingEp(ep);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.embedUrl.trim()) {
      toast.warning('Link video không được để trống');
      return;
    }

    const finalServerName = (form.serverName || '').trim() || DEFAULT_SERVER;

    try {
      const payload = {
        movieId,
        episodeNumber: Number(form.episodeNumber) || 1,
        title: form.title.trim() || undefined,
        embedUrl: form.embedUrl.trim(),
        durationSeconds: Number(form.durationSeconds) || 0,
        serverName: finalServerName,
      };

      if (editingEp) {
        const { movieId: _, ...updatePayload } = payload;
        await episodeApi.update(editingEp.id, updatePayload);
        toast.success(
          `Đã cập nhật Tập ${payload.episodeNumber} (${finalServerName})`,
        );
      } else {
        await episodeApi.create(payload);
        toast.success(
          `Đã thêm Tập ${payload.episodeNumber} vào ${finalServerName}`,
        );
      }
      resetForm();
      fetchEpisodes();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.message === 'string' ? err.message : '');
      if (msg && msg.toLowerCase().includes('unique')) {
        toast.error(
          `Trùng tập: (movie, episode_number, server_name) đã tồn tại. Đổi server hoặc số tập.`,
        );
      } else {
        toast.error('Lưu tập phim thất bại');
      }
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await episodeApi.delete(deleteTarget.id);
      toast.success(
        `Đã xóa Tập ${deleteTarget.episodeNumber} (${getServerName(deleteTarget)})`,
      );
      setDeleteTarget(null);
      fetchEpisodes();
    } catch {
      toast.error('Xóa tập thất bại');
    }
  };

  const toggleServer = (serverName) => {
    setCollapsedServers((prev) => ({ ...prev, [serverName]: !prev[serverName] }));
  };

  const renderInlineForm = () => (
    <div className="episode-form-inline" style={{ marginTop: 8, marginBottom: 8 }}>
      <select
        value={form.serverName}
        onChange={(e) => setForm({ ...form, serverName: e.target.value })}
        title="Chọn server"
        style={{ minWidth: 130 }}
      >
        {serverOptions.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
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
        style={{ flex: 2, minWidth: 240 }}
      />
      <input
        type="number"
        placeholder="Thời lượng (s)"
        value={form.durationSeconds}
        onChange={(e) => setForm({ ...form, durationSeconds: e.target.value })}
        min="0"
      />
      <div className="episode-form-actions">
        <button className="episode-save-btn" onClick={handleSave}>Lưu</button>
        <button className="episode-cancel-btn" onClick={resetForm}>Hủy</button>
      </div>
    </div>
  );

  const totalEpisodes = episodes.length;
  const totalServers = serverNamesOrdered.length;

  return (
    <div className="episode-section">
      <div className="episode-section-header">
        <h3 className="episode-section-title">
          📋 Danh sách tập ({totalEpisodes} tập • {totalServers} server)
        </h3>
        <button
          className="admin-add-btn"
          onClick={openAddForm}
          style={{ padding: '8px 14px', fontSize: 13 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm tập
        </button>
      </div>

      {/* Quick stats + hint */}
      {!loading && totalEpisodes > 0 && (
        <div className="episode-server-hint" style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          marginBottom: 8,
          padding: '0 4px',
        }}>
          💡 Thêm Server 2 để kích hoạt chip chọn server ở trang xem phim. Bấm vào tiêu đề server để thu/mở rộng.
        </div>
      )}

      {/* Episode List — gom theo server */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: 16, fontSize: 14 }}>
          Đang tải danh sách tập...
        </div>
      ) : totalEpisodes === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '12px 0' }}>
          Chưa có tập nào. Nhấn "Thêm tập" để bắt đầu.
        </div>
      ) : (
        <div className="episode-list">
          {/* Form thêm tập mới (khi không edit) */}
          {showForm && !editingEp && renderInlineForm()}

          {serverNamesOrdered.map((serverName) => {
            const list = episodesByServer[serverName] || [];
            const collapsed = collapsedServers[serverName];
            return (
              <div key={serverName} className="episode-server-group" style={{
                marginBottom: 14,
                border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                {/* Server header — bấm để collapse */}
                <div
                  className="episode-server-header"
                  onClick={() => toggleServer(serverName)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{
                        transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)',
                        transition: 'transform 0.18s',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      🎬 {serverName}
                    </span>
                    <span className="admin-badge" style={{
                      background: 'rgba(242, 101, 34, 0.18)',
                      color: 'var(--color-primary, #f26522)',
                      fontSize: 11,
                    }}>
                      {list.length} tập
                    </span>
                  </div>
                  <button
                    className="episode-server-add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm({
                        ...EMPTY_FORM,
                        serverName,
                        episodeNumber:
                          list.length > 0
                            ? Math.max(...list.map((e) => e.episodeNumber)) + 1
                            : 1,
                      });
                      setEditingEp(null);
                      setShowForm(true);
                      setCollapsedServers((prev) => ({ ...prev, [serverName]: false }));
                    }}
                    title={`Thêm tập vào ${serverName}`}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                      color: 'var(--text-secondary, #aaa)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    + Thêm vào server này
                  </button>
                </div>

                {/* Server content */}
                {!collapsed && (
                  <div style={{ padding: '8px 8px 4px' }}>
                    {list.map((ep) => (
                      <div
                        key={ep.id}
                        className="episode-item-container"
                        style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                      >
                        <div className={`episode-item ${editingEp?.id === ep.id ? 'is-editing' : ''}`}>
                          <div className="episode-number">{ep.episodeNumber}</div>
                          <div className="episode-info">
                            <div className="episode-title">
                              {ep.title || `Tập ${ep.episodeNumber}`}
                            </div>
                            <div className="episode-meta">
                              {formatDuration(ep.durationSeconds)} • {(ep.viewCount || 0).toLocaleString()} lượt xem
                            </div>
                          </div>
                          <div className="episode-actions">
                            <button
                              className="admin-action-btn btn-edit"
                              title="Sửa"
                              onClick={() => openEditForm(ep)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button
                              className="admin-action-btn btn-delete"
                              title="Xóa"
                              onClick={() => setDeleteTarget(ep)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </div>

                        {/* Form sửa tập hiện ngay bên dưới tập đang chọn */}
                        {showForm && editingEp?.id === ep.id && renderInlineForm()}
                      </div>
                    ))}

                    {list.length === 0 && (
                      <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '8px 12px' }}>
                        Server này chưa có tập nào.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa tập phim"
        message={`Bạn có chắc muốn xóa Tập ${deleteTarget?.episodeNumber} (${getServerName(deleteTarget)})?`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
