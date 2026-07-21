import { fetchApi } from './api';

export const ratingApi = {
  // Gửi hoặc cập nhật đánh giá cho phim (1-10 điểm)
  rateMovie: async ({ movieId, score, content }) => {
    const body = {
      movieId: Number(movieId),
      score: Number(score),
    };
    if (content && content.trim()) {
      body.content = content.trim();
    }
    return fetchApi('/ratings', {
      method: 'POST',
      data: body,
    });
  },

  // Lấy đánh giá của chính mình cho 1 phim
  getUserRating: async (movieId) => {
    return fetchApi(`/ratings/movie/${movieId}`);
  },

  // Xóa đánh giá của chính mình
  deleteRating: async (movieId) => {
    return fetchApi(`/ratings/movie/${movieId}`, {
      method: 'DELETE',
    });
  },
};
