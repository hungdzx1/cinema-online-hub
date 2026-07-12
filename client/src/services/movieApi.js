import { fetchApi } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('cinema_access_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const movieApi = {
  // === Public ===
  // Lấy danh sách phim hiển thị
  getAllMovies: async () => {
    try {
      return await fetchApi('/movies');
    } catch (error) {
      console.error('Failed to get movies', error);
      throw error;
    }
  },

  // Lọc và tìm kiếm phim
  filterMovies: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/movies/filter?${queryString}` : '/movies/filter';
      return await fetchApi(url);
    } catch (error) {
      console.error('Failed to filter movies', error);
      throw error;
    }
  },

  // Chi tiết trang xem phim công khai (gồm phim, tập phim, phim liên quan)
  getDetailBySlug: async (slug) => {
    try {
      return await fetchApi(`/movies/detail/${slug}`);
    } catch (error) {
      console.error(`Failed to get movie detail for ${slug}`, error);
      throw error;
    }
  },

  // === Admin ===
  // Get all movies (including hidden ones)
  getAllAdmin: () =>
    fetchApi('/movies/admin/all', { ...getAuthHeaders() }),

  // Get single movie by id
  getById: (id) =>
    fetchApi(`/movies/${id}`, { ...getAuthHeaders() }),

  // Create movie (admin)
  create: (data) =>
    fetchApi('/movies', { method: 'POST', data, ...getAuthHeaders() }),

  // Update movie (admin)
  update: (id, data) =>
    fetchApi(`/movies/${id}`, { method: 'PATCH', data, ...getAuthHeaders() }),

  // Delete movie (admin)
  delete: (id) =>
    fetchApi(`/movies/${id}`, { method: 'DELETE', ...getAuthHeaders() }),
};

