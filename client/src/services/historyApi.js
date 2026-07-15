import { fetchApi } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('cinema_access_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const historyApi = {
  // GET /watch-history - Lấy danh sách lịch sử
  getHistory: () =>
    fetchApi('/watch-history', { ...getAuthHeaders() }),

  // POST /watch-history - Lưu tiến độ xem
  saveProgress: (movieId, episodeId, progressSeconds) =>
    fetchApi('/watch-history', {
      method: 'POST',
      data: { movieId, episodeId, progressSeconds },
      ...getAuthHeaders(),
    }),

  // DELETE /watch-history/all - Xóa toàn bộ lịch sử
  clearAll: () =>
    fetchApi('/watch-history/all', { method: 'DELETE', ...getAuthHeaders() }),

  // DELETE /watch-history/:id - Xóa 1 dòng lịch sử
  deleteItem: (id) =>
    fetchApi(`/watch-history/${id}`, { method: 'DELETE', ...getAuthHeaders() }),
};
