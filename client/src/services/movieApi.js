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
      const query = new URLSearchParams();
      for (const key in params) {
        if (Array.isArray(params[key])) {
          params[key].forEach(val => query.append(key, val));
        } else if (params[key] !== null && params[key] !== undefined) {
          query.append(key, params[key]);
        }
      }
      const url = query.toString() ? `/movies/filter?${query.toString()}` : '/movies/filter';
      return await fetchApi(url);
    } catch (error) {
      console.error('Failed to filter movies', error);
      throw error;
    }
  },

  // Chi tiết trang xem phim công khai (gồm phim, tập phim, phim liên quan)
  getDetailBySlug: async (slug) => {
    try {
      // Lưu ý: Nếu backend route của bạn là /movies/slug/:slug thì đổi URL bên dưới thành `/movies/slug/${slug}`
      return await fetchApi(`/movies/detail/${slug}`);
    } catch (error) {
      console.error(`Failed to get movie detail for ${slug}`, error);
      throw error;
    }
  },

  // Thuật toán cập nhật lượt xem phim & tập phim
  incrementView: async (movieId, episodeId) => {
    try {
      return await fetchApi(`/movies/${movieId}/view`, {
        method: 'POST',
        data: { episodeId },
      });
    } catch (error) {
      console.error('Failed to increment view count', error);
    }
  },

  // ✅ THÊM: Random nhanh 1 phim
  getRandom: async () => {
    try {
      return await fetchApi('/movies/random');
    } catch (error) {
      console.error('Failed to get random movie', error);
      throw error;
    }
  },

  // ✅ THÊM: Random nâng cao theo bộ lọc
  getRandomAdvanced: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      for (const key in params) {
        if (Array.isArray(params[key])) {
          params[key].forEach(val => query.append(key, val));
        } else if (params[key] !== null && params[key] !== undefined) {
          query.append(key, params[key]);
        }
      }
      const url = query.toString() ? `/movies/random/advanced?${query.toString()}` : '/movies/random/advanced';
      return await fetchApi(url);
    } catch (error) {
      console.error('Failed to get advanced random movies', error);
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