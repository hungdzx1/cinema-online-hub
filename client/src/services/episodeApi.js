import { fetchApi } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('cinema_access_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const episodeApi = {
  // Get episodes of a movie
  getByMovie: (movieId) =>
    fetchApi(`/episodes/movie/${movieId}`, { ...getAuthHeaders() }),

  // Get single episode
  getOne: (id) =>
    fetchApi(`/episodes/${id}`, { ...getAuthHeaders() }),

  // Create episode (admin)
  create: (data) =>
    fetchApi('/episodes', { method: 'POST', data, ...getAuthHeaders() }),

  // Update episode (admin)
  update: (id, data) =>
    fetchApi(`/episodes/${id}`, { method: 'PATCH', data, ...getAuthHeaders() }),

  // Delete episode (admin)
  delete: (id) =>
    fetchApi(`/episodes/${id}`, { method: 'DELETE', ...getAuthHeaders() }),
};
