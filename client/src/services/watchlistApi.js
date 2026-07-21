import { fetchApi } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('cinema_access_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const watchlistApi = {
  // GET /watchlist — Lấy danh sách phim xem sau/theo dõi
  getWatchlist: () =>
    fetchApi('/watchlist', { ...getAuthHeaders() }),

  // POST /watchlist — Thêm phim vào danh sách theo dõi
  add: (movieId) =>
    fetchApi('/watchlist', {
      method: 'POST',
      data: { movieId: Number(movieId) },
      ...getAuthHeaders(),
    }),

  // GET /watchlist/check/:movieId — Kiểm tra phim đã được theo dõi chưa
  check: (movieId) =>
    fetchApi(`/watchlist/check/${movieId}`, { ...getAuthHeaders() }),

  // DELETE /watchlist/:movieId — Bỏ phim khỏi danh sách theo dõi
  remove: (movieId) =>
    fetchApi(`/watchlist/${movieId}`, {
      method: 'DELETE',
      ...getAuthHeaders(),
    }),
};
