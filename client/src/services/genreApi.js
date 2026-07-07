import { fetchApi } from './api';

export const genreApi = {
  // Lấy danh sách tất cả thể loại
  getAllGenres: async () => {
    try {
      return await fetchApi('/api/genres');
    } catch (error) {
      console.error('Failed to get genres', error);
      throw error;
    }
  }
};
