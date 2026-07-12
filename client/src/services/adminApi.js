import { fetchApi } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('cinema_access_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const adminApi = {
  // Dashboard stats
  getStats: () =>
    fetchApi('/admin/stats', { ...getAuthHeaders() }),

  // Top movies by views
  getTopMovies: () =>
    fetchApi('/admin/top-movies', { ...getAuthHeaders() }),

  // Recent users
  getRecentUsers: () =>
    fetchApi('/admin/recent-users', { ...getAuthHeaders() }),

  // Genre stats (movies per genre)
  getGenreStats: () =>
    fetchApi('/admin/genre-stats', { ...getAuthHeaders() }),
};
