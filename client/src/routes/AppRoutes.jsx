import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// ============================================================
// AppRoutes — khai báo TẤT CẢ đường dẫn của app.
// Dùng React.lazy + Suspense (code-splitting): mỗi trang chỉ được tải
// khi người dùng truy cập → tải trang ban đầu nhẹ & nhanh hơn.
// (đúng kỹ thuật code-splitting trong tài liệu React của cô)
//
// ⚠️ Các import dưới đây trỏ tới page CHƯA tồn tại — sẽ tạo dần ở các bước sau.
// Khi bạn kia làm xong giao diện, chỉ cần đặt file page đúng đường dẫn là chạy.
// ============================================================

// --- Trang công khai (không cần đăng nhập) ---
const HomePage = lazy(() => import('../features/movies/pages/HomePage'));
const MovieDetailPage = lazy(() => import('../features/movies/pages/MovieDetailPage'));
const FilterPage = lazy(() => import('../features/movies/pages/FilterPage'));
const RandomPage = lazy(() => import('../features/movies/pages/RandomPage'));

// --- Trang xác thực ---
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPasswordPage'));

// --- Trang cần đăng nhập ---
const WatchPage = lazy(() => import('../features/movies/pages/WatchPage'));
const FavoritesPage = lazy(() => import('../features/interactions/pages/FavoritesPage'));
const WatchlistPage = lazy(() => import('../features/interactions/pages/WatchlistPage'));
const HistoryPage = lazy(() => import('../features/interactions/pages/HistoryPage'));

// --- Trang admin ---
const DashboardPage = lazy(() => import('../features/admin/pages/DashboardPage'));
const MovieManagePage = lazy(() => import('../features/admin/pages/MovieManagePage'));

// --- Trang lỗi ---
const NotFoundPage = lazy(() => import('../features/movies/pages/NotFoundPage'));

export default function AppRoutes() {
  return (
    // Suspense: hiện "Đang tải..." trong lúc page (lazy) đang được tải về
    <Suspense fallback={<div style={{ padding: 40 }}>Đang tải...</div>}>
      <Routes>
        {/* ===== Công khai ===== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/phim/:slug" element={<MovieDetailPage />} />
        <Route path="/loc" element={<FilterPage />} />
        <Route path="/random" element={<RandomPage />} />

        {/* ===== Xác thực ===== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ===== Cần đăng nhập ===== */}
        <Route
          path="/xem/:slug"
          element={
            <ProtectedRoute>
              <WatchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/yeu-thich"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/xem-sau"
          element={
            <ProtectedRoute>
              <WatchlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lich-su"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />

        {/* ===== Admin ===== */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <DashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/phim"
          element={
            <AdminRoute>
              <MovieManagePage />
            </AdminRoute>
          }
        />

        {/* ===== 404 — không khớp route nào ở trên ===== */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
