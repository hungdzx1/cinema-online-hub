import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/useAuth';

// ============================================================
// ProtectedRoute — bọc các route YÊU CẦU ĐĂNG NHẬP.
// Chưa đăng nhập → chuyển hướng về /login.
// (Đây là "chặn phía Frontend" cho gọn UX — Backend vẫn verify thật qua Guard,
//  như đã bàn: FE chặn để điều hướng đẹp, không thay thế bảo mật Backend.)
// ============================================================
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Lưu lại trang user định vào (state.from) → sau khi login xong
    // có thể quay lại đúng trang đó thay vì về trang chủ.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
