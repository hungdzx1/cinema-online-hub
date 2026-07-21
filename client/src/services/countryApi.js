import { fetchApi } from './api';

export const countryApi = {
  // Lấy danh sách tất cả quốc gia
  getAll: async () => {
    try {
      return await fetchApi('/countries');
    } catch (error) {
      console.error('Failed to get countries', error);
      throw error;
    }
  }
};
