import { fetchApi } from './api';

// Các loại lỗi người dùng có thể báo cáo
export const ERROR_TYPES = [
  { value: 'video_not_load', label: 'Video không phát', icon: '📺' },
  { value: 'wrong_episode',  label: 'Sai tập phim',     icon: '🔗' },
  { value: 'audio_error',    label: 'Lỗi âm thanh',     icon: '🔊' },
  { value: 'subtitle_error', label: 'Lỗi phụ đề',       icon: '💬' },
  { value: 'other',          label: 'Lỗi khác',         icon: '⚠️' },
];

// Trạng thái xử lý báo lỗi (admin)
export const REPORT_STATUSES = [
  { value: 'pending',  label: 'Chờ xử lý',  color: '#f59e0b' },
  { value: 'resolved', label: 'Đã xử lý',   color: '#10b981' },
  { value: 'ignored',  label: 'Đã bỏ qua',  color: '#6b7280' },
];

export const errorReportApi = {
  // User gửi báo lỗi mới
  create: (payload) =>
    fetchApi('/error-reports', {
      method: 'POST',
      data: payload,
    }),

  // User xem báo lỗi của mình
  getMine: () => fetchApi('/error-reports/me'),

  // Admin xem tất cả báo lỗi
  getAll: () => fetchApi('/error-reports'),

  // Admin cập nhật trạng thái
  updateStatus: (id, status) =>
    fetchApi(`/error-reports/${id}/status`, {
      method: 'PATCH',
      data: { status },
    }),

  // Admin xóa báo lỗi
  delete: (id) =>
    fetchApi(`/error-reports/${id}`, {
      method: 'DELETE',
    }),
};