import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SearchInput } from '../common/SearchInput';
import { Button } from '../common/Button';
import { HistoryIcon, BookmarkIcon, LoginIcon, HomeIcon, GridIcon, FilmIcon, StarIcon, FlameIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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

export const Header = () => {
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const dropdownRef = useRef(null);

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value.trim())}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
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

  return (
    <header className="header-wrapper">
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
                    {/* User info header */}
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

      {/* Navigation Menu */}
      <div className="main-nav">
        <div className="container">
          <ul className="nav-list">
            <li className="nav-item active">
              <Link to="/"><HomeIcon size={18} /> Trang chủ</Link>
            </li>
            {/* <li className="nav-item">
              <a href="#"><GridIcon size={18} /> Thể Loại <span className="arrow-down">▾</span></a>
            </li>
            <li className="nav-item">
              <a href="#"><FilmIcon size={18} /> Phim Lẻ</a>
            </li> */}
            <li className="nav-item">
              <a href="#"><FlameIcon size={18} /> Đang Chiếu</a>
            </li>
            {/* <li className="nav-item">
              <a href="#"><HistoryIcon size={18} /> Lịch Chiếu</a>
            </li> */}
            <li className="nav-item">
              <a href="#"><BookmarkIcon size={18} /> Hoàn Thành</a>
            </li>
            {/* <li className="nav-item">
              <a href="#"><StarIcon size={18} /> Top 10 HH3D</a>
            </li> */}
            <li className="nav-item">
              <a href="#"><StarIcon size={18} /> Đánh Giá Cao</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
