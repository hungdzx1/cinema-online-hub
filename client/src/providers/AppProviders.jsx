import QueryProvider from './QueryProvider';
import { AuthProvider } from './AuthProvider';

// ============================================================
// AppProviders — gom TẤT CẢ provider vào 1 chỗ.
// Lợi: App.jsx chỉ cần bọc <AppProviders>, không phải lồng nhiều provider
// rối mắt. Sau này thêm provider mới (theme, toast...) chỉ sửa ở đây.
//
// Thứ tự lồng: QueryProvider ở NGOÀI, AuthProvider ở TRONG
// (vì AuthProvider có thể cần dùng query để kiểm tra phiên đăng nhập).
// ============================================================
export default function AppProviders({ children }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
