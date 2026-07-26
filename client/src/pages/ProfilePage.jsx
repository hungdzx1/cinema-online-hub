import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/userApi';
import { historyApi } from '../services/historyApi';
import { notificationApi } from '../services/notificationApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import './profile.css';

/* ---- Helpers ---- */
const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/* ---- Cloudinary config ---- */
const CLOUDINARY_CLOUD = 'lhow11kv';
const CLOUDINARY_PRESET = 'phimhay24h';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

/* ---- Upload file lên Cloudinary, trả về secure_url ---- */
const uploadToCloudinary = async (file) => {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_PRESET);
  form.append('folder', 'avatars');

  const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Upload Cloudinary thất bại');
  }
  const data = await res.json();
  return data.secure_url;  // https://res.cloudinary.com/lhow11kv/image/upload/...
};

/* ======== SVG ICONS ======== */
const CameraIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const UserIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const CalendarIcon= () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ClockIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const EditIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const ShieldIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const LockIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const UploadIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const CheckIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const AlertIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const HistoryIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3" /><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" /></svg>;
const BellIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const TrashIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
const CheckAllIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /><polyline points="22 10 13 19" /></svg>;

/* ---- Định dạng thời gian tương đối ---- */
const formatRelativeTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return d.toLocaleDateString('vi-VN');
};

/* ---- Map loại thông báo → nhãn + màu ---- */
const NOTI_TYPE_LABELS = {
  system: { label: 'Hệ thống', color: '#3b82f6' },
  new_episode: { label: 'Tập phim mới', color: '#10b981' },
};

/* ============== COMPONENT ============== */
export const ProfilePage = () => {
  useDocumentTitle('Trang Cá Nhân');
  const { user, isLoggedIn, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tabParam = searchParams.get('tab') || 'info';
  const [activeTab,    setActiveTab]    = useState(tabParam);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [loading,      setLoading]      = useState(true);
  const [profile,      setProfile]      = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [message,      setMessage]      = useState({ type: '', text: '' });
  
  /* history states */
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  /* notification states */
  const [notiList,       setNotiList]       = useState([]);
  const [loadingNotis,   setLoadingNotis]   = useState(false);
  const [notiFilter,     setNotiFilter]     = useState('all'); // all | unread | system | new_episode

  /* edit form */
  const [editUsername,   setEditUsername]   = useState('');
  const [editAvatarUrl,  setEditAvatarUrl]  = useState('');  // URL gõ tay
  const [avatarPreview,  setAvatarPreview]  = useState('');  // hiển thị preview
  const [avatarFile,     setAvatarFile]     = useState(null); // File object chờ upload
  const [avatarFileName, setAvatarFileName] = useState('');
  const [uploading,      setUploading]      = useState(false);

  /* ---- Fetch profile ---- */
  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }

    (async () => {
      try {
        setLoading(true);
        const data = await userApi.getMe();
        setProfile(data);
        setEditUsername(data.username || '');
        setEditAvatarUrl(data.avatarUrl || '');
        setAvatarPreview(data.avatarUrl || '');
      } catch {
        setMessage({ type: 'error', text: 'Không thể tải thông tin hồ sơ.' });
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoggedIn]);

  // Fetch watch history when activeTab becomes 'history'
  useEffect(() => {
    if (activeTab !== 'history') return;

    (async () => {
      try {
        setLoadingHistory(true);
        const data = await historyApi.getHistory();
        setHistoryList(data || []);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, [activeTab]);

  // ===== Fetch notifications when activeTab becomes 'notifications' =====
  const loadNotifications = async () => {
    try {
      setLoadingNotis(true);
      const data = await notificationApi.getMine();
      setNotiList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setNotiList([]);
    } finally {
      setLoadingNotis(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'notifications') return;
    if (!isLoggedIn) return;
    loadNotifications();
  }, [activeTab, isLoggedIn]);

  // ===== Click vào 1 thông báo: mark read + navigate linkUrl =====
  const handleNotiClick = async (noti) => {
    if (!noti.isRead) {
      try {
        await notificationApi.markRead(noti.id);
        setNotiList(prev => prev.map(n => (n.id === noti.id ? { ...n, isRead: true } : n)));
      } catch (err) {
        console.error('Mark read failed:', err);
      }
    }
    if (noti.linkUrl) {
      navigate(noti.linkUrl);
    }
  };

  // ===== Đánh dấu tất cả đã đọc =====
  const handleMarkAllRead = async () => {
    const hasUnread = notiList.some(n => !n.isRead);
    if (!hasUnread) return;
    try {
      await notificationApi.markAllRead();
      setNotiList(prev => prev.map(n => ({ ...n, isRead: true })));
      setMessage({ type: 'success', text: 'Đã đánh dấu tất cả thông báo là đã đọc.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (err) {
      console.error('Mark all read failed:', err);
      setMessage({ type: 'error', text: 'Không thể đánh dấu đã đọc.' });
    }
  };

  // ===== Xóa 1 thông báo =====
  const handleDeleteNoti = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Xóa thông báo này?')) return;
    try {
      await notificationApi.delete(id);
      setNotiList(prev => prev.filter(n => n.id !== id));
      setMessage({ type: 'success', text: 'Đã xóa thông báo.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 1500);
    } catch (err) {
      console.error('Delete notification failed:', err);
      setMessage({ type: 'error', text: 'Không thể xóa thông báo.' });
    }
  };

  // ===== Filter thông báo theo tab =====
  const filteredNotis = notiList.filter((n) => {
    if (notiFilter === 'unread') return !n.isRead;
    if (notiFilter === 'system') return n.type === 'system';
    if (notiFilter === 'new_episode') return n.type === 'new_episode';
    return true;
  });
  const unreadNotiCount = notiList.filter(n => !n.isRead).length;

  const formatProgress = (seconds) => {
    if (!seconds) return 'Bắt đầu xem';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `Đang xem đến ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleDeleteHistoryItem = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await historyApi.deleteItem(id);
      setHistoryList(prev => prev.filter(item => item.id !== id));
      setMessage({ type: 'success', text: 'Đã xóa tập phim khỏi lịch sử xem.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 1500);
    } catch {
      setMessage({ type: 'error', text: 'Không thể xóa lịch sử.' });
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem?')) return;
    try {
      await historyApi.clearAll();
      setHistoryList([]);
      setMessage({ type: 'success', text: 'Đã xóa toàn bộ lịch sử xem.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 1500);
    } catch {
      setMessage({ type: 'error', text: 'Không thể xóa lịch sử.' });
    }
  };

  /* ---- File select → preview cục bộ, chờ upload khi Save ---- */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';  // cho phép chọn lại cùng file

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file ảnh (jpg, png, webp…).' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ảnh không được vượt quá 10 MB.' });
      return;
    }

    // Preview tức thì bằng Object URL (chỉ dùng ở browser, không gửi đi)
    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setEditAvatarUrl('');       // xóa URL tay khi đã chọn file
    setAvatarFileName(file.name);
    setMessage({ type: '', text: '' });
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview); // giải phóng bộ nhớ
    }
    setAvatarFile(null);
    setAvatarPreview('');
    setEditAvatarUrl('');
    setAvatarFileName('');
  };

  /* ---- URL input change ---- */
  const handleUrlChange = (val) => {
    setEditAvatarUrl(val);
    setAvatarPreview(val);
    setAvatarFile(null);
    setAvatarFileName('');
  };

  /* ---- Save ---- */
  const handleSave = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!editUsername.trim()) {
      setMessage({ type: 'error', text: 'Tên đăng nhập không được để trống.' });
      return;
    }

    try {
      setSaving(true);

      /* Bước 1: Nếu có file → upload lên Cloudinary trước */
      let finalAvatarUrl = editAvatarUrl.trim() || null;
      if (avatarFile) {
        setMessage({ type: '', text: '' });
        setUploading(true);
        finalAvatarUrl = await uploadToCloudinary(avatarFile);
        setUploading(false);
      }

      /* Bước 2: Lưu vào DB qua PATCH /users/me */
      const updated = await userApi.updateMe({
        username:  editUsername.trim(),
        avatarUrl: finalAvatarUrl,
      });

      /* Dọn dẹp state */
      if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
      setProfile(updated);
      setAvatarPreview(updated.avatarUrl || '');
      setEditAvatarUrl(updated.avatarUrl || '');
      setAvatarFile(null);
      setAvatarFileName('');

      /* Sync Header */
      updateUser({ username: updated.username, avatarUrl: updated.avatarUrl });

      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công! 🎉' });
      setTimeout(() => {
        setActiveTab('info');
        setMessage({ type: '', text: '' });
      }, 1800);
    } catch (err) {
      setUploading(false);
      const raw = err?.response?.data?.message || err?.message || 'Cập nhật thất bại, vui lòng thử lại.';
      setMessage({ type: 'error', text: Array.isArray(raw) ? raw.join(', ') : raw });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    setEditUsername(profile?.username || '');
    setEditAvatarUrl(profile?.avatarUrl || '');
    setAvatarPreview(profile?.avatarUrl || '');
    setAvatarFile(null);
    setAvatarFileName('');
    setMessage({ type: '', text: '' });
    setActiveTab('info');
  };

  /* ---- Render helpers ---- */
  const displayUser     = profile || user;
  const currentAvatarUrl = avatarPreview || displayUser?.avatarUrl || '';

  /* Avatar element (shared) */
  const AvatarEl = ({ size = 'lg' }) => {
    const url = size === 'edit' ? avatarPreview : currentAvatarUrl;
    const cls = size === 'edit' ? 'avatar-edit-preview' : 'profile-avatar';
    const initCls = size === 'edit' ? 'avatar-edit-initials' : 'profile-avatar-initials';
    return url
      ? <img src={url} alt={displayUser?.username} className={cls} />
      : <div className={initCls}>{getInitials(displayUser?.username)}</div>;
  };

  /* ---- Not logged in ---- */
  if (!isLoggedIn) {
    return (
      <MainLayout>
        <div className="profile-not-logged">
          <div className="profile-not-logged-icon"><UserIcon /></div>
          <h2>Bạn chưa đăng nhập</h2>
          <p>Vui lòng đăng nhập để xem và quản lý hồ sơ cá nhân.</p>
          <Link to="/login" className="profile-login-link">Đăng nhập ngay</Link>
        </div>
      </MainLayout>
    );
  }

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <MainLayout>
        <div className="profile-page">
          <div className="profile-hero" />
          <div className="profile-container">
            <div className="profile-card">
              <div className="profile-header-row profile-skeleton">
                <div className="skeleton-avatar" />
                <div style={{ display:'flex', flexDirection:'column', gap:10, paddingBottom:8 }}>
                  <div className="skeleton-text lg" />
                  <div className="skeleton-text md" />
                </div>
              </div>
              <div className="profile-divider" />
              <div className="profile-body profile-skeleton" style={{ paddingTop:20 }}>
                <div className="profile-info-grid">
                  {[1,2,3,4].map(i => <div key={i} className="skeleton-block" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  /* ---- Main render ---- */
  return (
    <MainLayout>
      <div className="profile-page">

        {/* Hero */}
        <div className="profile-hero">
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
        </div>

        <div className="profile-container">
          <div className="profile-card">

            {/* ===== HEADER ROW ===== */}
            <div className="profile-header-row">
              <div className="profile-avatar-wrapper">
                <AvatarEl size="lg" />
                {/* Camera button visible always to enter edit mode quickly */}
                <button
                  type="button"
                  className="avatar-upload-btn"
                  title="Thay đổi ảnh đại diện"
                  onClick={() => { setActiveTab('edit'); fileInputRef.current?.click(); }}
                >
                  <CameraIcon />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="avatar-upload-input"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="profile-name-block">
                <h1 className="profile-display-name">{displayUser?.username}</h1>
                <span className={`profile-role-badge${displayUser?.role === 'admin' ? ' admin' : ''}`}>
                  {displayUser?.role === 'admin' ? '👑 Admin' : '🎬 Thành viên'}
                </span>
              </div>
            </div>

            <div className="profile-divider" />

            {/* ===== BODY ===== */}
            <div className="profile-body">

              {/* Tabs */}
              <div className="profile-tabs">
                <button
                  id="profile-tab-info"
                  className={`profile-tab${activeTab === 'info' ? ' active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  <UserIcon /> Thông tin
                </button>
                <button
                  id="profile-tab-edit"
                  className={`profile-tab${activeTab === 'edit' ? ' active' : ''}`}
                  onClick={() => setActiveTab('edit')}
                >
                  <EditIcon /> Chỉnh sửa
                </button>
                <button
                  id="profile-tab-security"
                  className={`profile-tab${activeTab === 'security' ? ' active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <ShieldIcon /> Bảo mật
                </button>
                <button
                  id="profile-tab-history"
                  className={`profile-tab${activeTab === 'history' ? ' active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  <HistoryIcon /> Lịch sử xem
                </button>
                <button
                  id="profile-tab-notifications"
                  className={`profile-tab${activeTab === 'notifications' ? ' active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <BellIcon /> Thông báo
                  {unreadNotiCount > 0 && (
                    <span className="profile-tab-badge">{unreadNotiCount > 9 ? '9+' : unreadNotiCount}</span>
                  )}
                </button>
              </div>

              {/* Alert messages */}
              {message.text && (
                <div className={`profile-message ${message.type}`}>
                  {message.type === 'success' ? <CheckIcon /> : <AlertIcon />}
                  {message.text}
                </div>
              )}

              {/* ===== TAB: INFO ===== */}
              {activeTab === 'info' && (
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <div className="profile-info-label"><UserIcon /> Tên đăng nhập</div>
                    <div className="profile-info-value">{displayUser?.username}</div>
                  </div>
                  <div className="profile-info-item">
                    <div className="profile-info-label"><MailIcon /> Email</div>
                    <div className="profile-info-value">{displayUser?.email}</div>
                  </div>
                  <div className="profile-info-item">
                    <div className="profile-info-label"><CalendarIcon /> Ngày tham gia</div>
                    <div className="profile-info-value">{formatDate(displayUser?.createdAt)}</div>
                  </div>
                  <div className="profile-info-item">
                    <div className="profile-info-label"><ClockIcon /> Đăng nhập lần cuối</div>
                    <div className="profile-info-value">{formatDate(displayUser?.lastLogin)}</div>
                  </div>
                </div>
              )}

              {/* ===== TAB: EDIT ===== */}
              {activeTab === 'edit' && (
                <div className="profile-edit-section">
                  <form className="profile-edit-form" onSubmit={handleSave}>

                    {/* Avatar picker */}
                    <div className="profile-field">
                      <label className="profile-field-label"><CameraIcon /> Ảnh đại diện</label>
                      <div className="avatar-edit-row">
                        <AvatarEl size="edit" />
                        <div className="avatar-edit-controls">
                          <button
                            type="button"
                            className="avatar-edit-btn"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <UploadIcon /> Chọn ảnh từ máy tính
                          </button>

                          {avatarFileName && (
                            <span className="avatar-file-badge">📎 {avatarFileName}</span>
                          )}

                          {avatarPreview && (
                            <button type="button" className="avatar-remove-btn" onClick={handleRemoveAvatar}>
                              ✕ Xóa ảnh
                            </button>
                          )}
                        </div>
                      </div>
                      <span className="profile-field-hint">
                        Hỗ trợ JPG, PNG, WebP · Tối đa 10 MB · Ảnh lưu trên Cloudinary CDN
                      </span>
                    </div>

                    {/* Avatar URL fallback */}
                    <div className="profile-field">
                      <label className="profile-field-label" htmlFor="edit-avatar-url">
                        Hoặc nhập URL ảnh đại diện
                      </label>
                      <input
                        id="edit-avatar-url"
                        type="url"
                        className="profile-field-input"
                        placeholder="https://example.com/avatar.jpg"
                        value={editAvatarUrl}
                        onChange={e => handleUrlChange(e.target.value)}
                        disabled={!!avatarFile}
                      />
                      {avatarFile && (
                        <span className="profile-field-hint">
                          Đang dùng ảnh tải lên. Xóa ảnh để nhập URL.
                        </span>
                      )}
                    </div>

                    {/* Username */}
                    <div className="profile-field">
                      <label className="profile-field-label" htmlFor="edit-username">
                        <UserIcon /> Tên đăng nhập
                      </label>
                      <input
                        id="edit-username"
                        type="text"
                        className="profile-field-input"
                        placeholder="Nhập tên đăng nhập"
                        value={editUsername}
                        onChange={e => setEditUsername(e.target.value)}
                        maxLength={50}
                      />
                    </div>

                    {/* Email (read-only) */}
                    <div className="profile-field">
                      <label className="profile-field-label" htmlFor="edit-email">
                        <MailIcon /> Email
                      </label>
                      <input
                        id="edit-email"
                        type="email"
                        className="profile-field-input"
                        value={displayUser?.email || ''}
                        disabled
                      />
                      <span className="profile-field-hint">Email không thể thay đổi.</span>
                    </div>

                    {/* Actions */}
                    <div className="profile-actions">
                      <button
                        id="btn-profile-save"
                        type="submit"
                        className="profile-btn profile-btn-primary"
                        disabled={saving}
                      >
                        {saving && <span className="profile-spinner" />}
                        {uploading ? '☁️ Đang upload…' : saving ? 'Đang lưu…' : 'Lưu thay đổi'}
                      </button>
                      <button
                        type="button"
                        className="profile-btn profile-btn-secondary"
                        onClick={handleCancel}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ===== TAB: SECURITY ===== */}
              {activeTab === 'security' && (
                <div className="profile-security-section">
                  <div className="security-item">
                    <div className="security-item-info">
                      <div className="security-item-icon lock"><LockIcon /></div>
                      <div>
                        <div className="security-item-title">Đổi mật khẩu</div>
                        <div className="security-item-desc">Cập nhật mật khẩu để bảo vệ tài khoản</div>
                      </div>
                    </div>
                    <button className="security-item-btn">Thay đổi</button>
                  </div>
                  <div className="security-item">
                    <div className="security-item-info">
                      <div className="security-item-icon shield"><ShieldIcon /></div>
                      <div>
                        <div className="security-item-title">Bảo mật hai lớp</div>
                        <div className="security-item-desc">Thêm lớp bảo mật bổ sung cho tài khoản</div>
                      </div>
                    </div>
                    <button className="security-item-btn">Thiết lập</button>
                  </div>
                </div>
              )}

              {/* ===== TAB: HISTORY ===== */}
              {activeTab === 'history' && (
                <div className="profile-history-section" style={{ animation: 'tabFadeIn 0.35s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>Phim đã xem</h3>
                    {historyList.length > 0 && (
                      <button 
                        type="button" 
                        onClick={handleClearAllHistory}
                        className="avatar-remove-btn"
                        style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-danger)' }}
                      >
                        ✕ Xóa toàn bộ
                      </button>
                    )}
                  </div>

                  {loadingHistory ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} className="security-item" style={{ height: '78px', opacity: 0.5, display: 'flex', alignItems: 'center', padding: '12px 16px' }}>
                          <div style={{ width: '48px', height: '64px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.08)', marginRight: '16px' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ height: '14px', width: '40%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '8px' }} />
                            <div style={{ height: '12px', width: '20%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : historyList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                      <p style={{ margin: 0, fontSize: '14px' }}>Bạn chưa xem bộ phim nào.</p>
                      <Link to="/" className="profile-btn profile-btn-primary" style={{ marginTop: '16px', textDecoration: 'none', display: 'inline-block', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600' }}>
                        Xem phim ngay
                      </Link>
                    </div>
                  ) : (
                    <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {historyList.map(item => (
                        <Link 
                          key={item.id}
                          to={`/movie/${item.movie?.slug}/watch?episode=${item.episode?.episodeNumber || 1}`}
                          className="security-item"
                          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', transition: 'transform 0.2s, background-color 0.2s' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
                            <div style={{ width: '48px', height: '64px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.04)' }}>
                              {item.movie?.posterUrl ? (
                                <img src={item.movie.posterUrl} alt={item.movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', background: 'var(--color-primary-gradient)' }} />
                              )}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div className="security-item-title" style={{ fontSize: '15px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, fontWeight: '600' }}>
                                {item.movie?.title}
                              </div>
                              <div className="security-item-desc" style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
                                Tập {item.episode?.episodeNumber || 1}: {item.episode?.title || `Tập ${item.episode?.episodeNumber || 1}`}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                <span style={{ color: '#00d2d1', fontWeight: '500' }}>⏳ {formatProgress(item.progressSeconds)}</span>
                                <span>•</span>
                                <span>📅 {formatDate(item.watchedAt)}</span>
                              </div>
                            </div>
                          </div>

                          <button 
                            type="button" 
                            className="avatar-remove-btn"
                            onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                            style={{ fontSize: '14px', padding: '8px 12px', marginLeft: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            title="Xóa khỏi lịch sử"
                          >
                            ✕
                          </button>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ===== TAB: NOTIFICATIONS ===== */}
              {activeTab === 'notifications' && (
                <div className="profile-notifications-section" style={{ animation: 'tabFadeIn 0.35s ease' }}>
                  {/* ===== Header: title + actions ===== */}
                  <div className="noti-section-header">
                    <div className="noti-section-title">
                      <h3>Thông báo của tôi</h3>
                      {unreadNotiCount > 0 && (
                        <span className="noti-unread-pill">{unreadNotiCount} chưa đọc</span>
                      )}
                    </div>
                    <div className="noti-section-actions">
                      <button
                        type="button"
                        className="noti-action-btn"
                        onClick={handleMarkAllRead}
                        disabled={unreadNotiCount === 0}
                        title="Đánh dấu tất cả là đã đọc"
                      >
                        <CheckAllIcon /> Đánh dấu đã đọc
                      </button>
                      <button
                        type="button"
                        className="noti-action-btn"
                        onClick={loadNotifications}
                        title="Tải lại danh sách"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        Làm mới
                      </button>
                    </div>
                  </div>

                  {/* ===== Filter chips ===== */}
                  <div className="noti-filter-bar">
                    {[
                      { key: 'all',         label: 'Tất cả' },
                      { key: 'unread',      label: `Chưa đọc${unreadNotiCount > 0 ? ` (${unreadNotiCount})` : ''}` },
                      { key: 'system',      label: 'Hệ thống' },
                      { key: 'new_episode', label: 'Tập phim mới' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        className={`noti-filter-chip${notiFilter === opt.key ? ' active' : ''}`}
                        onClick={() => setNotiFilter(opt.key)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* ===== List ===== */}
                  {loadingNotis ? (
                    <div className="noti-list">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="noti-card noti-card-skeleton">
                          <div className="noti-skeleton-dot" />
                          <div className="noti-skeleton-body">
                            <div className="noti-skeleton-line" style={{ width: '40%' }} />
                            <div className="noti-skeleton-line" style={{ width: '85%' }} />
                            <div className="noti-skeleton-line" style={{ width: '60%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredNotis.length === 0 ? (
                    <div className="noti-empty">
                      <div className="noti-empty-icon">🔔</div>
                      <div className="noti-empty-title">
                        {notiFilter === 'unread' ? 'Không có thông báo chưa đọc'
                          : notiFilter === 'system' ? 'Không có thông báo hệ thống'
                          : notiFilter === 'new_episode' ? 'Không có thông báo tập phim mới'
                          : 'Chưa có thông báo nào'}
                      </div>
                      <div className="noti-empty-desc">
                        Khi có thông báo mới từ hệ thống hoặc tập phim bạn theo dõi, nó sẽ xuất hiện tại đây.
                      </div>
                      <Link to="/" className="profile-btn profile-btn-primary" style={{ marginTop: '16px', textDecoration: 'none', display: 'inline-flex', padding: '10px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
                        Khám phá phim ngay
                      </Link>
                    </div>
                  ) : (
                    <div className="noti-list">
                      {filteredNotis.map((n) => {
                        const typeInfo = NOTI_TYPE_LABELS[n.type] || { label: n.type || 'Khác', color: '#6b7280' };
                        return (
                          <div
                            key={n.id}
                            className={`noti-card${!n.isRead ? ' unread' : ''}${n.linkUrl ? ' clickable' : ''}`}
                            onClick={() => handleNotiClick(n)}
                          >
                            <div className={`noti-card-dot${n.isRead ? ' read' : ' unread'}`} />
                            <div className="noti-card-body">
                              <div className="noti-card-top">
                                <span
                                  className="noti-card-type"
                                  style={{ background: typeInfo.color }}
                                >
                                  {typeInfo.label}
                                </span>
                                <span className="noti-card-time">{formatRelativeTime(n.createdAt)}</span>
                                {!n.isRead && <span className="noti-card-new">MỚI</span>}
                              </div>
                              <div className="noti-card-title">{n.title}</div>
                              {n.content && <div className="noti-card-desc">{n.content}</div>}
                              {n.linkUrl && (
                                <div className="noti-card-link">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" /><polyline points="12 5 19 12 12 19" />
                                  </svg>
                                  Xem chi tiết
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              className="noti-card-del"
                              onClick={(e) => handleDeleteNoti(e, n.id)}
                              title="Xóa thông báo"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>{/* /profile-body */}
          </div>{/* /profile-card */}
        </div>{/* /profile-container */}
      </div>{/* /profile-page */}
    </MainLayout>
  );
};
