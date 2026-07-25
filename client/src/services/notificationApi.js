import { fetchApi } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('cinema_access_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const notificationApi = {
  // GET /notifications — Lấy danh sách thông báo của user đang đăng nhập
  getAll: () =>
    fetchApi('/notifications', { ...getAuthHeaders() }),

  // GET /notifications/unread-count — Số thông báo chưa đọc
  getUnreadCount: () =>
    fetchApi('/notifications/unread-count', { ...getAuthHeaders() }),

  // POST /notifications — Admin tạo thông báo (cần body: { userId, title, content?, type?, linkUrl? })
  create: (data) =>
    fetchApi('/notifications', { method: 'POST', data, ...getAuthHeaders() }),

  // PATCH /notifications/:id/read — Đánh dấu 1 thông báo đã đọc
  markAsRead: (id) =>
    fetchApi(`/notifications/${id}/read`, { method: 'PATCH', ...getAuthHeaders() }),

  // PATCH /notifications/read-all — Đánh dấu tất cả đã đọc
  markAllAsRead: () =>
    fetchApi('/notifications/read-all', { method: 'PATCH', ...getAuthHeaders() }),

  // DELETE /notifications/:id — Xóa 1 thông báo
  delete: (id) =>
    fetchApi(`/notifications/${id}`, { method: 'DELETE', ...getAuthHeaders() }),
};