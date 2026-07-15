import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { MoviesPage } from './pages/admin/MoviesPage';
import { UsersPage } from './pages/admin/UsersPage';
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
