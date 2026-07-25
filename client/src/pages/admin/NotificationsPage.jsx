import { useState, useEffect } from 'react';
import { notificationApi } from '../../services/notificationApi';
import { userApi } from '../../services/userApi';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import '../../components/admin/admin.css';

const TYPE_OPTIONS = [
  { value: 'system', label: '📢 Hệ thống', color: '#3b82f6' },
  { value: 'new_episode', label: '🎬 Tập mới', color: '#10b981' },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const NotificationsPage = () => {
  useDocumentTitle('Quản Lý Thông Báo');
  const { isDark } = useTheme();
  const toast = useToast();

  // ===== State =====
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form tạo thông báo
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    title: '',
    content: '',
    type: 'system',
    linkUrl: '',
  });

  // ===== Fetch data =====
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userApi.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  // ===== Filtered list =====
  const filtered = notifications.filter((n) => {
    if (filter === 'unread' && n.isRead) return false;
    if (filter === 'read' && !n.isRead) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        n.title.toLowerCase().includes(term) ||
        (n.content || '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ===== Handlers =====
  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Đã đánh dấu đã đọc');
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await notificationApi.delete(deleteTarget.id);
      setNotifications((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      toast.success('Đã xóa thông báo');
      setDeleteTarget(null);
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleCreate = async () => {
    if (!form.userId) {
      toast.warning('Vui lòng chọn người nhận');
      return;
    }
    if (!form.title.trim()) {
      toast.warning('Tiêu đề không được để trống');
      return;
    }
    setSending(true);
    try {
      const payload = {
        userId: Number(form.userId),
        title: form.title.trim(),
        content: form.content.trim() || undefined,
        type: form.type,
        linkUrl: form.linkUrl.trim() || undefined,
      };
      await notificationApi.create(payload);
      toast.success(`Đã gửi thông báo cho user #${form.userId}`);
      setForm({ userId: '', title: '', content: '', type: 'system', linkUrl: '' });
      setShowForm(false);
      fetchNotifications();
    } catch (err) {
      toast.error('Gửi thông báo thất bại');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // ===== RENDER =====
  if (loading) {
    return <LoadingSpinner text="Đang tải thông báo..." />;
  }

  return (
    <div className="dashboard-page">
      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 14, color: isDark ? '#9ca3af' : '#64748b', marginBottom: 16,
        }}
      >
        <span>Admin</span>
        <span style={{ opacity: 0.6 }}>›</span>
        <span style={{ color: isDark ? '#fff' : '#1e293b', fontWeight: 600 }}>
          Quản lý thông báo
        </span>
      </nav>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12,
          padding: '14px 20px', borderRadius: 12,
          background: isDark ? '#16171d' : '#ffffff',
          border: `1px solid ${isDark ? '#2a2b33' : '#e2e8f0'}`,
          marginBottom: 24,
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', width: 260 }}>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: isDark ? '#8a99af' : '#94a3b8', pointerEvents: 'none',
            }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '9px 14px 9px 36px', borderRadius: 8,
              border: `1px solid ${isDark ? '#2a2b33' : '#e2e8f0'}`,
              background: isDark ? '#1c1d24' : '#f8fafc',
              color: isDark ? '#e5e7eb' : '#1e293b', fontSize: 13.5, outline: 'none',
            }}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { value: 'all', label: `Tất cả (${notifications.length})` },
            { value: 'unread', label: `Chưa đọc (${unreadCount})` },
            { value: 'read', label: `Đã đọc (${notifications.length - unreadCount})` },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              style={{
                padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
                background: filter === tab.value
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : isDark ? '#1c1d24' : '#f1f5f9',
                color: filter === tab.value ? '#fff' : isDark ? '#9ca3af' : '#64748b',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Mark all read */}
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              padding: '9px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', background: isDark ? '#1c1d24' : '#f1f5f9',
              color: isDark ? '#60a5fa' : '#3b82f6',
            }}
          >
            ✓ Đọc tất cả
          </button>
        )}

        {/* Create button */}
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 8, border: 'none',
            background: showForm
              ? (isDark ? '#374151' : '#e2e8f0')
              : 'linear-gradient(135deg, #3c50e0, #5b6fe6)',
            color: showForm ? (isDark ? '#e5e7eb' : '#475569') : '#fff',
            fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {showForm ? '✕ Đóng' : '➕ Gửi thông báo'}
        </button>
      </div>

      {/* ===== FORM TẠO THÔNG BÁO ===== */}
      {showForm && (
        <div
          style={{
            padding: 24, borderRadius: 12, marginBottom: 24,
            background: isDark ? '#16171d' : '#ffffff',
            border: `1px solid ${isDark ? '#2a2b33' : '#e2e8f0'}`,
          }}
        >
          <h3 style={{
            margin: '0 0 20px', fontSize: 16, fontWeight: 700,
            color: isDark ? '#fff' : '#1e293b',
          }}>
            📨 Gửi thông báo mới
          </h3>

          <div className="admin-form-grid">
            {/* Người nhận */}
            <div className="admin-form-group">
              <label className="admin-form-label">Người nhận <span className="required">*</span></label>
              <select
                className="admin-form-select"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
              >
                <option value="">— Chọn user —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    #{u.id} — {u.username} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Loại */}
            <div className="admin-form-group">
              <label className="admin-form-label">Loại thông báo</label>
              <select
                className="admin-form-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Tiêu đề */}
            <div className="admin-form-group full-width">
              <label className="admin-form-label">Tiêu đề <span className="required">*</span></label>
              <input
                className="admin-form-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="VD: Hệ thống bảo trì lúc 23:00"
                maxLength={255}
              />
            </div>

            {/* Nội dung */}
            <div className="admin-form-group full-width">
              <label className="admin-form-label">Nội dung (tùy chọn)</label>
              <textarea
                className="admin-form-textarea"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Mô tả chi tiết thông báo..."
                rows={3}
              />
            </div>

            {/* Link URL */}
            <div className="admin-form-group full-width">
              <label className="admin-form-label">Link đính kèm (tùy chọn)</label>
              <input
                className="admin-form-input"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="VD: /movie/one-piece"
                maxLength={500}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
            <button className="admin-btn-primary" onClick={handleCreate} disabled={sending}>
              {sending ? 'Đang gửi...' : '🚀 Gửi thông báo'}
            </button>
          </div>
        </div>
      )}

      {/* ===== DANH SÁCH THÔNG BÁO ===== */}
      <div
        style={{
          borderRadius: 12, overflow: 'hidden',
          background: isDark ? '#16171d' : '#ffffff',
          border: `1px solid ${isDark ? '#2a2b33' : '#e2e8f0'}`,
        }}
      >
        {filtered.length === 0 ? (
          <div style={{
            padding: '48px 20px', textAlign: 'center',
            color: isDark ? '#6b7280' : '#94a3b8', fontSize: 14,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
            {searchTerm
              ? `Không tìm thấy thông báo với "${searchTerm}"`
              : filter === 'unread'
                ? 'Không có thông báo chưa đọc'
                : 'Chưa có thông báo nào'}
          </div>
        ) : (
          <div>
            {filtered.map((noti, idx) => (
              <div
                key={noti.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '16px 20px',
                  borderBottom: idx < filtered.length - 1
                    ? `1px solid ${isDark ? '#1f2028' : '#f1f5f9'}`
                    : 'none',
                  background: noti.isRead
                    ? 'transparent'
                    : isDark ? 'rgba(99, 102, 241, 0.06)' : 'rgba(99, 102, 241, 0.04)',
                  transition: 'background 0.2s ease',
                }}
              >
                {/* Icon type */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                  background: noti.type === 'new_episode'
                    ? (isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.1)')
                    : (isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.1)'),
                }}>
                  {noti.type === 'new_episode' ? '🎬' : '📢'}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 14, fontWeight: noti.isRead ? 500 : 700,
                      color: isDark ? '#e5e7eb' : '#1e293b',
                    }}>
                      {noti.title}
                    </span>
                    {!noti.isRead && (
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#6366f1', flexShrink: 0,
                      }} />
                    )}
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 4,
                      fontWeight: 600,
                      background: noti.type === 'new_episode'
                        ? (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)')
                        : (isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.12)'),
                      color: noti.type === 'new_episode' ? '#10b981' : '#3b82f6',
                    }}>
                      {noti.type === 'new_episode' ? 'Tập mới' : 'Hệ thống'}
                    </span>
                  </div>

                  {noti.content && (
                    <div style={{
                      fontSize: 13, color: isDark ? '#9ca3af' : '#64748b',
                      lineHeight: 1.5, marginBottom: 4,
                    }}>
                      {noti.content}
                    </div>
                  )}

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    fontSize: 12, color: isDark ? '#6b7280' : '#94a3b8',
                  }}>
                    <span>🕐 {formatDate(noti.createdAt)}</span>
                    {noti.linkUrl && (
                      <span style={{ color: isDark ? '#60a5fa' : '#3b82f6' }}>
                        🔗 {noti.linkUrl}
                      </span>
                    )}
                    <span>👤 User #{noti.userId}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {!noti.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(noti.id)}
                      title="Đánh dấu đã đọc"
                      style={{
                        width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isDark ? '#1c1d24' : '#f1f5f9',
                        color: isDark ? '#60a5fa' : '#3b82f6', fontSize: 16,
                      }}
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(noti)}
                    title="Xóa thông báo"
                    style={{
                      width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDark ? '#1c1d24' : '#f1f5f9',
                      color: '#ef4444', fontSize: 14,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa thông báo"
        message={`Bạn có chắc muốn xóa thông báo "${deleteTarget?.title}"?`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};