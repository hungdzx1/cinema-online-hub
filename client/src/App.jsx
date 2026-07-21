import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { MoviesPage } from './pages/admin/MoviesPage';
import { UsersPage } from './pages/admin/UsersPage';
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/"       element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />
            <Route path="/403"    element={<ForbiddenPage />} />
            <Route path="/movie/:slug"       element={<MovieDetailPage />} />
            <Route path="/movie/:slug/watch" element={<MovieDetailPage />} />
            <Route path="/profile"  element={<ProfilePage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />

            {/* Admin routes - Protected */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="movies" element={<MoviesPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WatchlistProvider>
    </AuthProvider>
  );
}

export default App;
