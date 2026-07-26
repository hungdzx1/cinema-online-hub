import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../services/notificationApi';
import './admin.css';

const BREADCRUMBS = {
  '/admin': 'Dashboard',
  '/admin/movies': 'Quản lý phim',
  '/admin/users': 'Quản lý tài khoản',
  '/admin/comments': 'Quản lý bình luận',
  '/admin/categories': 'Thể loại & Quốc gia',
  '/admin/notifications': 'Thông báo',
};

// ===== Danh sách mọi chức năng admin để tìm kiếm =====
const ADMIN_SEARCH_ITEMS = [
  {
    path: '/admin',
    label: 'Dashboard',
    keywords: ['dashboard', 'bảng điều khiển', 'thống kê', 'tổng quan', 'trang chủ admin'],
    group: 'Trang',
  },
  {
    path: '/admin/movies',
    label: 'Quản lý phim',
    keywords: ['phim', 'movie', 'quản lý phim', 'thêm phim', 'xóa phim', 'sửa phim', 'episode', 'tập phim'],
    group: 'Quản lý',
  },
  {
    path: '/admin/users',
    label: 'Quản lý tài khoản',
    keywords: ['user', 'tài khoản', 'người dùng', 'khách hàng', 'ban', 'role', 'quyền'],
    group: 'Quản lý',
  },
  {
    path: '/admin/comments',
    label: 'Quản lý bình luận',
    keywords: ['comment', 'bình luận', 'đánh giá', 'review', 'ẩn bình luận'],
    group: 'Quản lý',
  },
  {
    path: '/admin/categories',
    label: 'Thể loại & Quốc gia',
    keywords: ['thể loại', 'genre', 'quốc gia', 'country', 'danh mục', 'category'],
    group: 'Quản lý',
  },
  {
    path: '/admin/notifications',
    label: 'Thông báo',
    keywords: ['thông báo', 'notification', 'chuông', 'báo lỗi', 'error report'],
    group: 'Trang',
  },
  {
    path: '/admin',
    label: 'Xuất báo cáo',
    keywords: ['xuất', 'báo cáo', 'report', 'export', 'in ấn', 'print'],
    group: 'Hành động',
    action: 'export',
  },
  {
    path: '/',
    label: 'Về trang chủ website',
    keywords: ['trang chủ', 'homepage', 'home', 'website', 'ra ngoài', 'exit'],
    group: 'Điều hướng',
  },
];

// Bỏ dấu tiếng Việt để so khớp không phân biệt có dấu/không dấu
const normalize = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

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

// Map type thông báo → label tiếng Việt + màu nhãn
const NOTI_TYPE_LABELS = {
  system: { label: 'Hệ thống', color: '#3b82f6' },
  new_episode: { label: 'Tập phim mới', color: '#10b981' },
};

export const AdminHeader = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // ===== State cho dropdown avatar, thông báo, tìm kiếm =====
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotiMenu, setShowNotiMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const userMenuRef = useRef(null);
  const notiMenuRef = useRef(null);
  const searchRef = useRef(null);

  // ===== State cho thông báo (lấy từ API thật) =====
  const [notifications, setNotifications] = useState([]);
  const [loadingNotis, setLoadingNotis] = useState(false);
  const [notiError, setNotiError] = useState('');

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notiMenuRef.current && !notiMenuRef.current.contains(e.target)) {
        setShowNotiMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageTitle = BREADCRUMBS[pathname] || 'Admin';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ===== Lọc kết quả tìm kiếm theo label + keywords, không phân biệt hoa/thường & dấu =====
  const searchResults = useMemo(() => {
    const q = normalize(searchQuery.trim());
    if (!q) return [];
    return ADMIN_SEARCH_ITEMS.filter((item) => {
      const inLabel = normalize(item.label).includes(q);
      const inKeywords = item.keywords.some((k) => normalize(k).includes(q));
      return inLabel || inKeywords;
    });
  }, [searchQuery]);

  // Gom kết quả theo nhóm để hiển thị có tiêu đề nhóm
  const groupedResults = useMemo(() => {
    const groups = {};
    searchResults.forEach((item) => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });
    return groups;
  }, [searchResults]);

  const handleSelectResult = (item) => {
    setSearchQuery('');
    setShowSearchResults(false);
    if (item.action === 'export') {
      navigate(item.path);
      setTimeout(() => window.print(), 300);
      return;
    }
    navigate(item.path);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleSelectResult(searchResults[0]);
    }
    if (e.key === 'Escape') {
      setShowSearchResults(false);
    }
  };

  // ===== Load thông báo khi mở dropdown =====
  const loadNotifications = async () => {
    setLoadingNotis(true);
    setNotiError('');
    try {
      const data = await notificationApi.getMine();
      setNotifications(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch (err) {
      console.error('Load notifications failed:', err);
      setNotiError('Không tải được thông báo.');
      setNotifications([]);
    } finally {
      setLoadingNotis(false);
    }
  };

  useEffect(() => {
    if (showNotiMenu) {
      loadNotifications();
    }
  }, [showNotiMenu]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ===== Đánh dấu 1 thông báo đã đọc + điều hướng nếu có link =====
  const handleNotiClick = async (noti) => {
    // Nếu chưa đọc → gọi API mark read
    if (!noti.isRead) {
      try {
        await notificationApi.markRead(noti.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n)),
        );
      } catch (err) {
        console.error('Mark read failed:', err);
      }
    }
    // Nếu có linkUrl → điều hướng
    if (noti.linkUrl) {
      setShowNotiMenu(false);
      navigate(noti.linkUrl);
    }
  };

  // ===== Đánh dấu tất cả đã đọc =====
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark all read failed:', err);
    }
  };

  // ===== Xóa 1 thông báo =====
  const handleDeleteNoti = async (e, id) => {
    e.stopPropagation(); // Ngăn click lan ra noti item
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Delete notification failed:', err);
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h1 className="admin-page-title">{pageTitle}</h1>
        <div className="admin-breadcrumb">
          <span>Admin</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="admin-breadcrumb-current">{pageTitle}</span>
        </div>
      </div>

      <div
        className="admin-header-right"
        style={{ display: 'flex', alignItems: 'center', gap: 14 }}
      >
        {/* ===== Thanh tìm kiếm chức năng ===== */}
        <div ref={searchRef} style={{ position: 'relative', width: 260 }}>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: isDark ? '#8a99af' : '#94a3b8', pointerEvents: 'none',
            }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm chức năng..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
              setShowUserMenu(false);
              setShowNotiMenu(false);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setShowSearchResults(true);
              setShowUserMenu(false);
              setShowNotiMenu(false);
            }}
            onKeyDown={handleSearchKeyDown}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              borderRadius: 8,
              border: `1px solid ${isDark ? '#2a2b33' : '#e2e8f0'}`,
              background: isDark ? '#1c1d24' : '#f8fafc',
              color: isDark ? '#e5e7eb' : '#1e293b',
              fontSize: 13.5,
              outline: 'none',
            }}
          />

          {showSearchResults && searchQuery.trim() && (
            <div style={{
              position: 'absolute', top: 44, left: 0, width: 320,
              background: isDark ? '#16171d' : '#fff',
              border: `1px solid ${isDark ? '#2a2b33' : '#e2e8f0'}`,
              borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              zIndex: 999, maxHeight: 340, overflowY: 'auto',
            }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 13, color: isDark ? '#8a99af' : '#94a3b8' }}>
                  Không tìm thấy chức năng phù hợp.
                </div>
              ) : (
                Object.entries(groupedResults).map(([groupName, items]) => (
                  <div key={groupName}>
                    <div style={{
                      padding: '8px 16px 4px', fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                      color: isDark ? '#6b7789' : '#94a3b8',
                    }}>
                      {groupName}
                    </div>
                    {items.map((item, idx) => (
                      <button
                        key={`${item.path}-${item.label}-${idx}`}
                        type="button"
                        onClick={() => handleSelectResult(item)}
                        style={{
                          display: 'flex', alignItems: 'center', width: '100%',
                          padding: '9px 16px', background: 'transparent', border: 'none',
                          textAlign: 'left', cursor: 'pointer', fontSize: 13.5,
                          color: isDark ? '#e5e7eb' : '#1e293b',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ===== Icon chuông thông báo — đã nối API thật ===== */}
        <div ref={notiMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setShowNotiMenu((v) => !v);
              setShowUserMenu(false);
              setShowSearchResults(false);
            }}
            aria-label="Thông báo"
            style={{
              position: 'relative',
              width: 38, height: 38, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: `1px solid ${isDark ? '#2a2b33' : '#e2e8f0'}`,
              color: isDark ? '#c9ccd3' : '#64748b',
              cursor: 'pointer',
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -2, right: -2,
                minWidth: 16, height: 16, borderRadius: 8,
                background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${isDark ? '#16171d' : '#fff'}`,
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotiMenu && (
            <div style={{
              position: 'absolute', top: 46, right: 0, width: 340,
              background: isDark ? '#16171d' : '#fff',
              border: `1px solid ${isDark ? '#2a2b33' : '#e2e8f0'}`,
              borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              zIndex: 999, overflow: 'hidden',
              maxHeight: 480, display: 'flex', flexDirection: 'column',
            }}>
              {/* Header: tiêu đề + nút "đánh dấu tất cả đã đọc" */}
              <div style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${isDark ? '#2a2b33' : '#f1f5f9'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontWeight: 700, fontSize: 14,
                color: isDark ? '#fff' : '#1e293b',
              }}>
                <span>
                  Thông báo
                  {unreadCount > 0 && (
                    <span style={{
                      marginLeft: 8, fontSize: 11, fontWeight: 700,
                      color: '#fff', background: '#ef4444',
                      padding: '1px 7px', borderRadius: 8,
                    }}>
                      {unreadCount} mới
                    </span>
                  )}
                </span>
                {unreadCount > 0 && !loadingNotis && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'transparent', border: 'none',
                      color: 'var(--color-primary, #f26522)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>

              {/* Body: danh sách thông báo */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {loadingNotis ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13, color: isDark ? '#8a99af' : '#94a3b8' }}>
                    Đang tải...
                  </div>
                ) : notiError ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13, color: '#ef4444' }}>
                    {notiError}
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: '40px 16px', textAlign: 'center', fontSize: 13, color: isDark ? '#8a99af' : '#94a3b8' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔕</div>
                    Không có thông báo mới.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const typeInfo = NOTI_TYPE_LABELS[n.type] || { label: n.type, color: '#6b7280' };
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotiClick(n)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: `1px solid ${isDark ? '#22232a' : '#f1f5f9'}`,
                          cursor: n.linkUrl ? 'pointer' : 'default',
                          position: 'relative',
                          background: !n.isRead
                            ? (isDark ? 'rgba(242,101,34,0.06)' : 'rgba(242,101,34,0.04)')
                            : 'transparent',
                          transition: 'background 0.15s',
                          display: 'flex', gap: 10,
                        }}
                        onMouseEnter={(e) => {
                          if (n.linkUrl) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = !n.isRead
                            ? (isDark ? 'rgba(242,101,34,0.06)' : 'rgba(242,101,34,0.04)')
                            : 'transparent';
                        }}
                      >
                        {/* Chấm đỏ thông báo chưa đọc */}
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: n.isRead ? 'transparent' : '#ef4444',
                          marginTop: 6, flexShrink: 0,
                          border: n.isRead ? `1px solid ${isDark ? '#333' : '#d1d5db'}` : 'none',
                        }} />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2,
                          }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700,
                              color: '#fff',
                              background: typeInfo.color,
                              padding: '1px 7px', borderRadius: 6,
                              textTransform: 'uppercase', letterSpacing: 0.3,
                            }}>
                              {typeInfo.label}
                            </span>
                            <span style={{
                              fontSize: 11, color: isDark ? '#6b7789' : '#94a3b8',
                              marginLeft: 'auto',
                            }}>
                              {formatRelative(n.createdAt)}
                            </span>
                          </div>
                          <div style={{
                            fontSize: 13, fontWeight: 600,
                            color: isDark ? '#e5e7eb' : '#1e293b',
                            lineHeight: 1.35,
                            marginBottom: n.content ? 2 : 0,
                          }}>
                            {n.title}
                          </div>
                          {n.content && (
                            <div style={{
                              fontSize: 12, color: isDark ? '#8a99af' : '#64748b',
                              lineHeight: 1.4,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}>
                              {n.content}
                            </div>
                          )}
                        </div>

                        {/* Nút xóa */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNoti(e, n.id)}
                          title="Xóa thông báo"
                          style={{
                            position: 'absolute', top: 8, right: 8,
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: isDark ? '#6b7789' : '#94a3b8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: 0.6, transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0.6';
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = isDark ? '#6b7789' : '#94a3b8';
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer: link xem tất cả */}
              {notifications.length > 0 && (
                <div style={{
                  borderTop: `1px solid ${isDark ? '#2a2b33' : '#f1f5f9'}`,
                  padding: 0,
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotiMenu(false);
                      navigate('/admin/notifications');
                    }}
                    style={{
                      width: '100%', padding: '11px 16px',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--color-primary, #f26522)',
                      fontSize: 13, fontWeight: 600,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark ? 'rgba(242,101,34,0.08)' : 'rgba(242,101,34,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Xem tất cả thông báo →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          className="admin-theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
        >
          {isDark ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* Avatar + dropdown user */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setShowUserMenu((v) => !v);
              setShowNotiMenu(false);
              setShowSearchResults(false);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '4px 10px 4px 4px', borderRadius: 24,
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f26522, #ff8a4c)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, overflow: 'hidden', flexShrink: 0,
            }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{user?.username?.charAt(0).toUpperCase() || 'A'}</span>
              )}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: isDark ? '#e5e7eb' : '#1e293b' }}>
                {user?.username || 'admin'}
              </div>
              <div style={{ fontSize: 11.5, color: '#f26522', fontWeight: 600 }}>👑 Admin</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isDark ? '#8a99af' : '#94a3b8' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute', top: 48, right: 0, width: 200,
              background: isDark ? '#16171d' : '#fff',
              border: `1px solid ${isDark ? '#2a2b33' : '#e2e8f0'}`,
              borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              zIndex: 999, overflow: 'hidden',
            }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '12px 16px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#ef4444', fontSize: 13.5, fontWeight: 600,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};