import { fetchApi } from './api';

export const adminApi = {
  // ✅ BỎ getAuthHeaders() ĐI VÌ api.js ĐÃ TỰ ĐỘNG GẮN TOKEN
  getStats: () => fetchApi('/admin/stats'),
  getTopMovies: () => fetchApi('/admin/top-movies'),
  getRecentUsers: () => fetchApi('/admin/recent-users'),
  getGenreStats: () => fetchApi('/admin/genre-stats'),
};