import { fetchApi } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('cinema_access_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const commentApi = {
  // Lấy danh sách bình luận của 1 phim
  getByMovieId: async (movieId) => {
    try {
      return await fetchApi(`/comments/movie/${movieId}`);
    } catch (error) {
      console.error(`Failed to get comments for movie #${movieId}`, error);
      throw error;
    }
  },

  // Viết bình luận mới
  create: async (data) => {
    try {
      return await fetchApi('/comments', {
        method: 'POST',
        data,
        ...getAuthHeaders()
      });
    } catch (error) {
      console.error('Failed to create comment', error);
      throw error;
    }
  },

  // Xóa bình luận
  delete: async (id) => {
    try {
      return await fetchApi(`/comments/${id}`, {
        method: 'DELETE',
        ...getAuthHeaders()
      });
    } catch (error) {
      console.error(`Failed to delete comment #${id}`, error);
      throw error;
    }
  }
};
