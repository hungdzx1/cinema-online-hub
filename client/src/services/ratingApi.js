import { fetchApi } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('cinema_access_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const ratingApi = {
  // Gửi hoặc cập nhật đánh giá cho phim (1-10 điểm)
  rateMovie: async ({ movieId, score, content }) => {
    return fetchApi('/ratings', {
      method: 'POST',
      data: { movieId: Number(movieId), score: Number(score), content },
      ...getAuthHeaders(),
    });
  },

  // Lấy đánh giá của chính mình cho 1 phim
  getUserRating: async (movieId) => {
    return fetchApi(`/ratings/movie/${movieId}`, {
      ...getAuthHeaders(),
    });
  },

  // Xóa đánh giá của chính mình
  deleteRating: async (movieId) => {
    return fetchApi(`/ratings/movie/${movieId}`, {
      method: 'DELETE',
      ...getAuthHeaders(),
    });
  },
};
