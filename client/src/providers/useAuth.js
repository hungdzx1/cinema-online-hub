import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// ============================================================
// useAuth — hook tiện dùng để đọc trạng thái đăng nhập ở bất kỳ component nào.
// Cách dùng: const { user, isAuthenticated, login, logout } = useAuth();
// Tách ra file riêng (chỉ export hàm) → hết cảnh báo react-refresh.
// ============================================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  }
  return context;
}