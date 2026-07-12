import { Link } from 'react-router-dom';
import '../components/admin/admin.css';

export const ForbiddenPage = () => {
  return (
    <div className="forbidden-page">
      <div className="forbidden-content">
        <div className="forbidden-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="forbidden-code">403</h1>
        <h2 className="forbidden-title">Truy cập bị từ chối</h2>
        <p className="forbidden-desc">
          Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản quản trị viên.
        </p>
        <Link to="/" className="forbidden-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Về Trang Chủ
        </Link>
      </div>
    </div>
  );
};
