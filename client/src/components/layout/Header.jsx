import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { SearchInput } from '../common/SearchInput';
import { Button } from '../common/Button';
import { HistoryIcon, BookmarkIcon, LoginIcon, HomeIcon, GridIcon, FilmIcon, StarIcon, FlameIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { genreApi } from '../../services/genreApi';
import { notificationApi } from '../../services/notificationApi';
import './layout.css';

/* ---- Avatar fallback helper ---- */
const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');

/* ---- User Avatar Component ---- */
const UserAvatar = ({ user }) => {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.username}
        className="user-avatar-img"
      />
    );
  }
  return (
    <div className="user-avatar-initials">
      {getInitials(user.username)}
    </div>
  );
};

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

// Map type thông báo → label + màu
const NOTI_TYPE_LABELS = {
  system: { label: 'Hệ thống', color: '#3b82f6' },
  new_episode: { label: 'Tập phim mới', color: '#10b981' },
};

export const Header = () => {
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout, isLoggedIn } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const dropdownRef = useRef(null);

  const currentPath = location.pathname;
  const currentGenreId = searchParams.get('genreIds');
  const currentCountry = searchParams.get('country');
  const currentType = searchParams.get('type');
  const currentStatus = searchParams.get('status');
  const currentSortBy = searchParams.get('sortBy');

  const isHomeActive = currentPath === '/' && !currentGenreId && !currentCountry && !currentType && !currentStatus && !currentSortBy;
  const isGenreActive = Boolean(currentGenreId);
  const isCountryActive = Boolean(currentCountry);
  const isPhimLeActive = currentType === 'phim_le';
  const isPhimBoActive = currentType === 'phim_bo';
  const isRandomActive = currentPath === '/random';
  const isOngoingActive = currentStatus === 'ongoing';
  const isCompletedActive = currentStatus === 'completed';
  const isTopRatedActive = currentSortBy === 'rating';

  // State cho menu thể loại / quốc gia
  const [genres, setGenres] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const mockCountries = [
    { id: 1, name: 'Việt Nam', slug: 'viet-nam' },
    { id: 2, name: 'Hàn Quốc', slug: 'han-quoc' },
    { id: 3, name: 'Trung Quốc', slug: 'trung-quoc' },
    { id: 4, name: 'Nhật Bản', slug: 'nhat-ban' },
    { id: 5, name: 'Thái Lan', slug: 'thai-lan' },
    { id: 6, name: 'Âu Mỹ', slug: 'au-my' },
    { id: 7, name: 'Hồng Kông', slug: 'hong-kong' },
    { id: 8, name: 'Đài Loan', slug: 'dai-loan' },
    { id: 9, name: 'Ấn Độ', slug: 'an-do' },
    { id: 10, name: 'Anh', slug: 'anh' },
  ];

  // ===== State cho dropdown thông báo người dùng =====
  const [showNotiMenu, setShowNotiMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotis, setLoadingNotis] = useState(false);
  const [notiError, setNotiError] = useState('');
  const notiRef = useRef(null);

  // Gọi API lấy danh sách thể loại
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await genreApi.getAll();
        setGenres(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Lỗi tải thể loại", e);
      }
    };
    fetchGenres();
  }, []);

  // Bắt sự kiện cuộn chuột để đổi nền header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value.trim())}`);
    }
  };

  // Close dropdown khi click ra ngoài (cả user menu và noti menu)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setShowNotiMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  // ===== Load thông báo khi mở dropdown =====
  const loadNotifications = async () => {
    setLoadingNotis(true);
    setNotiError('');
    try {
      const data = await notificationApi.getMine();
      setNotifications(Array.isArray(data) ? data.slice(0, 8) : []);
    } catch (err) {
      console.error('Load notifications failed:', err);
      setNotiError('Không tải được thông báo.');
      setNotifications([]);
    } finally {
      setLoadingNotis(false);
    }
  };

  useEffect(() => {
    if (showNotiMenu && isLoggedIn) {
      loadNotifications();
    }
  }, [showNotiMenu, isLoggedIn]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ===== Click vào thông báo: mark read + navigate linkUrl =====
  const handleNotiClick = async (noti) => {
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
    e.stopPropagation();
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Delete notification failed:', err);
    }
  };

  return (
    <header className={`header-wrapper ${scrolled ? 'scrolled' : ''}`}>
      {/* Top Bar */}
      <div className="header-top">
        <div className="container header-top-inner">
          <div className="logo-section">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h1 className="logo-text">Phim Hay <span className="text-gradient">24h</span></h1>
            </Link>
          </div>

          <div className="search-section">
            <SearchInput
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSubmit={handleSearch}
            />
          </div>

          <div className="action-section">
            <Button
              variant="dark"
              icon={<HistoryIcon size={18} />}
              onClick={() => navigate(isLoggedIn ? '/profile?tab=history' : '/login')}
            >
              Lịch sử
            </Button>
            <Button
              variant="dark"
              icon={<BookmarkIcon size={18} />}
              onClick={() => navigate(isLoggedIn ? '/watchlist' : '/login')}
            >
              Theo dõi
            </Button>

            {/* ===== Chuông thông báo (chỉ hiện khi đã login) ===== */}
            {isLoggedIn && (
              <div className="user-noti-menu" ref={notiRef}>
                <button
                  type="button"
                  className="user-noti-trigger"
                  onClick={() => setShowNotiMenu((v) => !v)}
                  aria-label="Thông báo"
                  title="Thông báo"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="user-noti-badge">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotiMenu && (
                  <div className="user-noti-dropdown" role="menu">
                    {/* Header */}
                    <div className="user-noti-header">
                      <span className="user-noti-title">
                        Thông báo
                        {unreadCount > 0 && (
                          <span className="user-noti-new-badge">{unreadCount} mới</span>
                        )}
                      </span>
                      {unreadCount > 0 && !loadingNotis && (
                        <button
                          type="button"
                          className="user-noti-markall"
                          onClick={handleMarkAllRead}
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>

                    {/* Body */}
                    <div className="user-noti-body">
                      {loadingNotis ? (
                        <div className="user-noti-empty">Đang tải...</div>
                      ) : notiError ? (
                        <div className="user-noti-empty user-noti-error">{notiError}</div>
                      ) : notifications.length === 0 ? (
                        <div className="user-noti-empty">
                          <div style={{ fontSize: 28, marginBottom: 8 }}>🔕</div>
                          Không có thông báo mới.
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const typeInfo = NOTI_TYPE_LABELS[n.type] || { label: n.type, color: '#6b7280' };
                          return (
                            <div
                              key={n.id}
                              className={`user-noti-item ${!n.isRead ? 'unread' : ''} ${n.linkUrl ? 'clickable' : ''}`}
                              onClick={() => handleNotiClick(n)}
                            >
                              <div className={`user-noti-dot ${n.isRead ? 'read' : 'unread'}`} />
                              <div className="user-noti-content">
                                <div className="user-noti-item-top">
                                  <span
                                    className="user-noti-type"
                                    style={{ background: typeInfo.color }}
                                  >
                                    {typeInfo.label}
                                  </span>
                                  <span className="user-noti-time">{formatRelative(n.createdAt)}</span>
                                </div>
                                <div className="user-noti-item-title">{n.title}</div>
                                {n.content && (
                                  <div className="user-noti-item-desc">{n.content}</div>
                                )}
                              </div>
                              <button
                                type="button"
                                className="user-noti-del"
                                onClick={(e) => handleDeleteNoti(e, n.id)}
                                title="Xóa thông báo"
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

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        className="user-noti-footer"
                        onClick={() => {
                          setShowNotiMenu(false);
                          navigate('/profile?tab=notifications');
                        }}
                      >
                        Xem tất cả thông báo →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <button
              id="btn-theme-toggle"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-icon sun-icon">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-icon moon-icon">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {isLoggedIn ? (
              /* ---- User dropdown ---- */
              <div className="user-menu" ref={dropdownRef}>
                <button
                  id="btn-user-menu"
                  className="user-menu-trigger"
                  onClick={() => setDropdownOpen(v => !v)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <UserAvatar user={user} />
                  <span className="user-menu-name">{user.username}</span>
                  <svg
                    className={`user-menu-arrow${dropdownOpen ? ' open' : ''}`}
                    width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown" role="menu">
                    <div className="user-dropdown-header">
                      <UserAvatar user={user} />
                      <div className="user-dropdown-info">
                        <div className="user-dropdown-name">{user.username}</div>
                        <div className="user-dropdown-email">{user.email}</div>
                        {user.role && (
                          <div className={`user-dropdown-role role-${user.role.toLowerCase()}`}>
                            {user.role === 'admin' ? '👑 Admin' : '🎬 Thành viên'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="user-dropdown-divider" />

                    <button className="user-dropdown-item" role="menuitem" onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                      Hồ sơ cá nhân
                    </button>

                    <button className="user-dropdown-item" role="menuitem" onClick={() => { navigate('/profile?tab=history'); setDropdownOpen(false); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      Lịch sử xem
                    </button>

                    <button className="user-dropdown-item" role="menuitem" onClick={() => { navigate('/watchlist'); setDropdownOpen(false); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                      </svg>
                      Phim theo dõi
                    </button>

                    {/* ===== Tab thông báo trong menu user ===== */}
                    <button className="user-dropdown-item" role="menuitem" onClick={() => { navigate('/profile?tab=notifications'); setDropdownOpen(false); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                      Thông báo của tôi
                    </button>

                    {/* ===== Chỉ Admin mới thấy nút này ===== */}
                    {user?.role === 'admin' && (
                      <>
                        <button className="user-dropdown-item" role="menuitem" onClick={() => { navigate('/admin'); setDropdownOpen(false); }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                          </svg>
                          Quản trị Admin
                        </button>
                        <div className="user-dropdown-divider" />
                      </>
                    )}

                    <div className="user-dropdown-divider" />

                    <button
                      id="btn-logout"
                      className="user-dropdown-item logout"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                id="btn-login"
                variant="dark"
                icon={<LoginIcon size={18} />}
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notice Bar */}
      {!isLoggedIn && (
        <div className="notice-bar">
          <div className="container">
            Hãy <Link to="/login" style={{ color: 'var(--color-warning)', fontWeight: 600 }}>đăng nhập</Link> để xem lịch sử và phim yêu thích nhé
          </div>
        </div>
      )}

      {/* ===== Navigation Menu ===== */}
      <div className="main-nav">
        <div className="container">
          <ul className="nav-list">
            <li className={`nav-item ${isHomeActive ? 'active' : ''}`}>
              <Link to="/"><HomeIcon size={18} /> Trang chủ</Link>
            </li>

            {/* Menu Thể Loại (Hover xổ xuống) */}
            <li className={`nav-item has-mega-menu ${isGenreActive ? 'active' : ''}`}
                onMouseEnter={() => setActiveMenu('genres')}
                onMouseLeave={() => setActiveMenu(null)}>
              <div className="nav-link-trigger">
                <GridIcon size={18} /> Thể Loại <span className="arrow-down">▾</span>
              </div>
              {activeMenu === 'genres' && (
                <div className="mega-menu-box">
                  {genres.map(g => {
                    const isActive = currentGenreId === String(g.id);
                    return (
                      <Link
                        key={g.id}
                        to={`/search?genreIds=${g.id}`}
                        className={`mega-menu-item ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveMenu(null)}
                      >
                        {g.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>

            {/* Menu Quốc Gia (Hover xổ xuống) */}
            <li className={`nav-item has-mega-menu ${isCountryActive ? 'active' : ''}`}
                onMouseEnter={() => setActiveMenu('countries')}
                onMouseLeave={() => setActiveMenu(null)}>
              <div className="nav-link-trigger">
                <FilmIcon size={18} /> Quốc Gia <span className="arrow-down">▾</span>
              </div>
              {activeMenu === 'countries' && (
                <div className="mega-menu-box">
                  {mockCountries.map(c => {
                    const isActive = currentCountry === c.slug;
                    return (
                      <Link
                        key={c.id}
                        to={`/search?country=${c.slug}`}
                        className={`mega-menu-item ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveMenu(null)}
                      >
                        {c.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>

            <li className={`nav-item ${isPhimLeActive ? 'active' : ''}`}>
              <Link to="/search?type=phim_le"><FilmIcon size={18} /> Phim Lẻ</Link>
            </li>
            <li className={`nav-item ${isPhimBoActive ? 'active' : ''}`}>
              <Link to="/search?type=phim_bo"><FlameIcon size={18} /> Phim Bộ</Link>
            </li>
            <li className={`nav-item ${isRandomActive ? 'active' : ''}`}>
              <Link to="/random" style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                <StarIcon size={18} /> Random Phim
              </Link>
            </li>
            <li className={`nav-item ${isOngoingActive ? 'active' : ''}`}>
              <Link to="/search?status=ongoing"><FlameIcon size={18} /> Đang Chiếu</Link>
            </li>
            <li className={`nav-item ${isCompletedActive ? 'active' : ''}`}>
              <Link to="/search?status=completed"><BookmarkIcon size={18} /> Hoàn Thành</Link>
            </li>
            <li className={`nav-item ${isTopRatedActive ? 'active' : ''}`}>
              <Link to="/search?sortBy=rating"><StarIcon size={18} /> Đánh Giá Cao</Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
