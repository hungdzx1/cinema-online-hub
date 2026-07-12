import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './admin.css';

const BREADCRUMBS = {
  '/admin': 'Dashboard',
  '/admin/movies': 'Quản lý phim',
  '/admin/users': 'Quản lý tài khoản',
};

export const AdminHeader = () => {
  const { pathname } = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const pageTitle = BREADCRUMBS[pathname] || 'Admin';

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

      <div className="admin-header-right">
        <button
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
      </div>
    </header>
  );
};
