import { useState } from 'react';
import { AuthContext } from './AuthContext';

// ============================================================
// AuthProvider — quản lý trạng thái đăng nhập cho TOÀN APP.
// File này CHỈ export 1 component (AuthProvider) → hết cảnh báo react-refresh.
//  - Đọc token + user từ localStorage (khôi phục phiên khi mở lại app)
//  - Cung cấp: user, isAuthenticated, isAdmin, login(), logout()
// ============================================================

// Đọc user đã lưu trong localStorage (nếu có) — chạy 1 lần khi khởi tạo state
function getStoredUser() {
  const storedUser = localStorage.getItem('user');
  const token = localStorage.getItem('accessToken');
  if (!storedUser || !token) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    // Dữ liệu hỏng → dọn sạch, coi như chưa đăng nhập
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    return null;
  }
}

export function AuthProvider({ children }) {
  // user = null nghĩa là CHƯA đăng nhập.
  // Truyền getStoredUser (lazy init) → React chỉ chạy hàm này 1 lần lúc đầu.
  const [user, setUser] = useState(getStoredUser);

  // Gọi sau khi login thành công. Backend trả { accessToken, user }.
  const login = (accessToken, userData) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Đăng xuất: xóa token + user ở client (JWT stateless nên chỉ xóa phía client)
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user, // object user hoặc null
    isAuthenticated: !!user, // true nếu đã đăng nhập
    isAdmin: user?.role === 'admin', // tiện kiểm tra quyền admin
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}