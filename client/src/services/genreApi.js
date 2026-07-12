import { fetchApi } from './api';

export const genreApi = {
  // Lấy danh sách tất cả thể loại
  getAll: async () => {
    try {
      return await fetchApi('/genres');
    } catch (error) {
      console.error('Failed to get genres', error);
      throw error;
    }
  }
};
