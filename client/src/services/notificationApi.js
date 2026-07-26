import { fetchApi } from './api';

export const notificationApi = {
  // Admin gửi thông báo cho user
  create: (payload) =>
    fetchApi('/notifications', {
      method: 'POST',
      data: payload,
    }),

  // User xem thông báo của mình
  getMine: () => fetchApi('/notifications'),

  // Số chưa đọc
  countUnread: () => fetchApi('/notifications/unread-count'),

  // Đánh dấu tất cả đã đọc
  markAllRead: () =>
    fetchApi('/notifications/read-all', { method: 'PATCH' }),

  // Đánh dấu 1 cái đã đọc
  markRead: (id) =>
    fetchApi(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Xóa thông báo
  delete: (id) =>
    fetchApi(`/notifications/${id}`, { method: 'DELETE' }),
};
