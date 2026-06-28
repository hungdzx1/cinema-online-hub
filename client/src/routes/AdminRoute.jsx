import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/useAuth';

// ============================================================
// AdminRoute — bọc các route CHỈ DÀNH CHO ADMIN.
// Logic 2 lớp:
//  1. Chưa đăng nhập → về /login
//  2. Đã đăng nhập nhưng KHÔNG phải admin → về trang chủ
// (Tương ứng JwtAuthGuard + RolesGuard phía Backend, nhưng đây chỉ là
//  điều hướng UX — Backend mới là nơi chặn thật.)
// ============================================================
export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Đã đăng nhập nhưng không đủ quyền → đá về trang chủ
    return <Navigate to="/" replace />;
  }

  return children;
}
