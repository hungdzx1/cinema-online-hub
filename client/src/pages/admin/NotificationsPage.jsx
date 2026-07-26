import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { notificationApi } from '../../services/notificationApi';
import {
  errorReportApi,
  ERROR_TYPES,
  REPORT_STATUSES,
} from '../../services/errorReportApi';
import './admin-notifications.css';

const NOTI_TYPES = [
  { value: 'system',     label: 'Hệ thống' },
  { value: 'new_episode', label: 'Tập phim mới' },
];

// Định dạng thời gian tương đối: "5 phút trước"
const formatRelative = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return d.toLocaleDateString('vi-VN');
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const AdminNotificationsPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('noti');

  // ===== Notifications state =====
  const [notiForm, setNotiForm] = useState({
    userId: '',
    title: '',
    content: '',
    type: 'system',
    linkUrl: '',
  });
  const [sendingNoti, setSendingNoti] = useState(false);
  const [myNotis, setMyNotis] = useState([]);
  const [loadingNotis, setLoadingNotis] = useState(false);

  // ===== Error reports state =====
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ===== Load notifications (của admin đang login) =====
  const loadNotis = useCallback(async () => {
    setLoadingNotis(true);
    try {
      const data = await notificationApi.getMine();
      setMyNotis(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load notifications failed:', err);
      toast.error('Không tải được danh sách thông báo.');
    } finally {
      setLoadingNotis(false);
    }
  }, [toast]);

  // ===== Load error reports =====
  const loadReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const data = await errorReportApi.getAll();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load error reports failed:', err);
      toast.error('Không tải được danh sách báo lỗi.');
    } finally {
      setLoadingReports(false);
    }
  }, [toast]);

  useEffect(() => {
    loadNotis();
    loadReports();
  }, [loadNotis, loadReports]);

  // ===== Handlers: Notification =====
  const handleSendNoti = async (e) => {
    e.preventDefault();
    if (sendingNoti) return;

    const userId = Number(notiForm.userId);
    if (!userId || userId < 1) {
      toast.warning('Vui lòng nhập ID người nhận hợp lệ.');
      return;
    }
    if (!notiForm.title.trim()) {
      toast.warning('Vui lòng nhập tiêu đề thông báo.');
      return;
    }

    setSendingNoti(true);
    try {
      await notificationApi.create({
        userId,
        title: notiForm.title.trim(),
        content: notiForm.content.trim() || undefined,
        type: notiForm.type,
        linkUrl: notiForm.linkUrl.trim() || undefined,
      });
      toast.success(`Đã gửi thông báo đến user #${userId}.`);
      setNotiForm({
        userId: '',
        title: '',
        content: '',
        type: 'system',
        linkUrl: '',
      });
      // Load lại danh sách nếu user nhận là chính admin
      loadNotis();
    } catch (err) {
      console.error('Send notification failed:', err);
      const msg =
        err?.response?.data?.message ||
        'Gửi thông báo thất bại. Kiểm tra ID người dùng.';
      toast.error(typeof msg === 'string' ? msg : 'Gửi thông báo thất bại.');
    } finally {
      setSendingNoti(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setMyNotis((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả là đã đọc.');
    } catch (err) {
      console.error('Mark all read failed:', err);
      toast.error('Không thể đánh dấu đã đọc.');
    }
  };

  const handleDeleteNoti = async (id) => {
    try {
      await notificationApi.delete(id);
      setMyNotis((prev) => prev.filter((n) => n.id !== id));
      toast.success('Đã xóa thông báo.');
    } catch (err) {
      console.error('Delete notification failed:', err);
      toast.error('Xóa thông báo thất bại.');
    }
  };

  // ===== Handlers: Error Reports =====
  const handleUpdateStatus = async (id, status) => {
    try {
      await errorReportApi.updateStatus(id, status);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
      const label = REPORT_STATUSES.find((s) => s.value === status)?.label || status;
      toast.success(`Đã chuyển báo lỗi #${id} → "${label}".`);
    } catch (err) {
      console.error('Update status failed:', err);
      toast.error('Cập nhật trạng thái thất bại.');
    }
  };

  const handleDeleteReport = async () => {
    if (!confirmDelete) return;
    try {
      await errorReportApi.delete(confirmDelete);
      setReports((prev) => prev.filter((r) => r.id !== confirmDelete));
      toast.success('Đã xóa báo lỗi.');
    } catch (err) {
      console.error('Delete report failed:', err);
      toast.error('Xóa báo lỗi thất bại.');
    } finally {
      setConfirmDelete(null);
    }
  };

  // ===== Stats for error reports =====
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === 'pending').length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const ignored = reports.filter((r) => r.status === 'ignored').length;
    return { total, pending, resolved, ignored };
  }, [reports]);

  // ===== Filtered reports =====
  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      if (filterType !== 'all' && r.errorType !== filterType) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (q) {
        const hay = `${r.id} ${r.description || ''} ${r.movieId} ${r.episodeId || ''} ${r.userId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [reports, search, filterType, filterStatus]);

  const getErrorType = (val) => ERROR_TYPES.find((t) => t.value === val);
  const getStatus = (val) => REPORT_STATUSES.find((s) => s.value === val);

  return (
    <div className="admin-noti-page">
      {/* Tabs */}
      <div className="admin-noti-tabs">
        <button
          className={`admin-noti-tab ${activeTab === 'noti' ? 'active' : ''}`}
          onClick={() => setActiveTab('noti')}
        >
          🔔 Thông báo
        </button>
        <button
          className={`admin-noti-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          🚩 Báo lỗi phim
          {stats.pending > 0 && (
            <span className="admin-noti-tab-badge">{stats.pending}</span>
          )}
        </button>
      </div>

      {/* ===== Tab 1: Notifications ===== */}
      {activeTab === 'noti' && (
        <div className="admin-noti-grid">
          {/* Left: send form */}
          <div className="admin-noti-card">
            <h3 className="admin-noti-card-title">Gửi thông báo mới</h3>
            <form className="admin-noti-form" onSubmit={handleSendNoti}>
              <div className="admin-noti-field">
                <label>ID người nhận *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="VD: 5"
                  value={notiForm.userId}
                  onChange={(e) => setNotiForm({ ...notiForm, userId: e.target.value })}
                  required
                />
              </div>

              <div className="admin-noti-field">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  maxLength={255}
                  placeholder="VD: Phim mới đã được cập nhật"
                  value={notiForm.title}
                  onChange={(e) => setNotiForm({ ...notiForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-noti-field">
                <label>Loại</label>
                <select
                  value={notiForm.type}
                  onChange={(e) => setNotiForm({ ...notiForm, type: e.target.value })}
                >
                  {NOTI_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="admin-noti-field">
                <label>Nội dung</label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  placeholder="Mô tả chi tiết thông báo..."
                  value={notiForm.content}
                  onChange={(e) => setNotiForm({ ...notiForm, content: e.target.value })}
                />
              </div>

              <div className="admin-noti-field">
                <label>Link (nếu có)</label>
                <input
                  type="text"
                  maxLength={500}
                  placeholder="VD: /movie/ten-phim"
                  value={notiForm.linkUrl}
                  onChange={(e) => setNotiForm({ ...notiForm, linkUrl: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="admin-noti-submit"
                disabled={sendingNoti}
              >
                {sendingNoti ? 'Đang gửi...' : 'Gửi thông báo'}
              </button>
            </form>
          </div>

          {/* Right: list of own notifications */}
          <div className="admin-noti-card">
            <div className="admin-noti-card-header">
              <h3 className="admin-noti-card-title">
                Thông báo của bạn
                <span className="admin-noti-count">{myNotis.length}</span>
              </h3>
              {myNotis.length > 0 && (
                <button
                  className="admin-noti-markall"
                  onClick={handleMarkAllRead}
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>

            {loadingNotis ? (
              <div className="admin-noti-empty">Đang tải...</div>
            ) : myNotis.length === 0 ? (
              <div className="admin-noti-empty">Chưa có thông báo nào.</div>
            ) : (
              <ul className="admin-noti-list">
                {myNotis.map((n) => (
                  <li
                    key={n.id}
                    className={`admin-noti-item ${!n.isRead ? 'unread' : ''}`}
                  >
                    <div className="admin-noti-item-top">
                      <span className="admin-noti-item-title">{n.title}</span>
                      <button
                        className="admin-noti-item-del"
                        onClick={() => handleDeleteNoti(n.id)}
                        title="Xóa"
                      >
                        ×
                      </button>
                    </div>
                    {n.content && (
                      <p className="admin-noti-item-content">{n.content}</p>
                    )}
                    <div className="admin-noti-item-meta">
                      <span className="admin-noti-item-type">
                        {NOTI_TYPES.find((t) => t.value === n.type)?.label || n.type}
                      </span>
                      <span>{formatRelative(n.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ===== Tab 2: Error Reports ===== */}
      {activeTab === 'reports' && (
        <div className="admin-reports-wrap">
          {/* Stats */}
          <div className="admin-reports-stats">
            <button
              className={`admin-stat-card ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus(filterStatus === 'all' ? 'all' : 'all')}
            >
              <span className="admin-stat-num">{stats.total}</span>
              <span className="admin-stat-label">Tổng</span>
            </button>
            <button
              className={`admin-stat-card pending ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
            >
              <span className="admin-stat-num">{stats.pending}</span>
              <span className="admin-stat-label">Chờ xử lý</span>
            </button>
            <button
              className={`admin-stat-card resolved ${filterStatus === 'resolved' ? 'active' : ''}`}
              onClick={() => setFilterStatus(filterStatus === 'resolved' ? 'all' : 'resolved')}
            >
              <span className="admin-stat-num">{stats.resolved}</span>
              <span className="admin-stat-label">Đã xử lý</span>
            </button>
            <button
              className={`admin-stat-card ignored ${filterStatus === 'ignored' ? 'active' : ''}`}
              onClick={() => setFilterStatus(filterStatus === 'ignored' ? 'all' : 'ignored')}
            >
              <span className="admin-stat-num">{stats.ignored}</span>
              <span className="admin-stat-label">Đã bỏ qua</span>
            </button>
          </div>

          {/* Toolbar */}
          <div className="admin-reports-toolbar">
            <input
              type="text"
              className="admin-reports-search"
              placeholder="Tìm theo mô tả, ID phim, ID user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả loại lỗi</option>
              {ERROR_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              {REPORT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              className="admin-reports-refresh"
              onClick={loadReports}
              disabled={loadingReports}
            >
              {loadingReports ? 'Đang tải...' : '↻ Làm mới'}
            </button>
          </div>

          {/* Table */}
          <div className="admin-reports-table-wrap">
            {loadingReports ? (
              <div className="admin-noti-empty">Đang tải báo lỗi...</div>
            ) : filteredReports.length === 0 ? (
              <div className="admin-noti-empty">
                {reports.length === 0
                  ? 'Chưa có báo lỗi nào từ người dùng.'
                  : 'Không tìm thấy báo lỗi phù hợp bộ lọc.'}
              </div>
            ) : (
              <table className="admin-reports-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Loại lỗi</th>
                    <th>Phim / Tập</th>
                    <th>Mô tả</th>
                    <th>Người báo</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r) => {
                    const t = getErrorType(r.errorType);
                    const s = getStatus(r.status);
                    return (
                      <tr key={r.id}>
                        <td className="col-id">#{r.id}</td>
                        <td>
                          <span className="report-type-badge">
                            {t?.icon} {t?.label || r.errorType}
                          </span>
                        </td>
                        <td>
                          <span className="report-movie">
                            Phim #{r.movieId}
                            {r.episodeId && (
                              <span className="report-ep"> · Tập #{r.episodeId}</span>
                            )}
                          </span>
                        </td>
                        <td className="col-desc">
                          {r.description || <em className="muted">—</em>}
                        </td>
                        <td className="col-user">User #{r.userId}</td>
                        <td className="col-time" title={formatDate(r.createdAt)}>
                          {formatRelative(r.createdAt)}
                        </td>
                        <td>
                          <span
                            className="report-status-badge"
                            style={{ background: s?.color || '#888' }}
                          >
                            {s?.label || r.status}
                          </span>
                        </td>
                        <td className="col-actions">
                          {r.status !== 'resolved' && (
                            <button
                              className="report-action resolve"
                              onClick={() => handleUpdateStatus(r.id, 'resolved')}
                              title="Đánh dấu đã xử lý"
                            >
                              ✓
                            </button>
                          )}
                          {r.status !== 'ignored' && (
                            <button
                              className="report-action ignore"
                              onClick={() => handleUpdateStatus(r.id, 'ignored')}
                              title="Bỏ qua"
                            >
                              ⊘
                            </button>
                          )}
                          {r.status !== 'pending' && (
                            <button
                              className="report-action reopen"
                              onClick={() => handleUpdateStatus(r.id, 'pending')}
                              title="Mở lại"
                            >
                              ↻
                            </button>
                          )}
                          <button
                            className="report-action delete"
                            onClick={() => setConfirmDelete(r.id)}
                            title="Xóa"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa báo lỗi?"
        message={`Bạn có chắc muốn xóa báo lỗi #${confirmDelete}? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDeleteReport}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default AdminNotificationsPage;