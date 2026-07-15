import { fetchApi } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('cinema_access_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const userApi = {
  // Get current user profile
  getMe: () =>
    fetchApi('/users/me', { ...getAuthHeaders() }),

  // Update current user profile
  updateMe: (data) =>
    fetchApi('/users/me', { method: 'PATCH', data, ...getAuthHeaders() }),

  // Get all users (admin)
  getAll: () =>
    fetchApi('/users', { ...getAuthHeaders() }),

  // Get single user
  getOne: (id) =>
    fetchApi(`/users/${id}`, { ...getAuthHeaders() }),

  // Toggle ban/unban
  toggleBan: (id) =>
    fetchApi(`/users/${id}/ban`, { method: 'PATCH', ...getAuthHeaders() }),

  // Update user role
  updateRole: (id, role) =>
    fetchApi(`/users/${id}/role`, { method: 'PATCH', data: { role }, ...getAuthHeaders() }),

  // Delete user
  delete: (id) =>
    fetchApi(`/users/${id}`, { method: 'DELETE', ...getAuthHeaders() }),
};
