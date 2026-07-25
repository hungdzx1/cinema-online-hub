import { fetchApi } from './api';


export const genreApi = {
  getAll: async () => {
    try {
      return await fetchApi('/genres');
    } catch (error) {
      console.error('Failed to get genres', error);
      throw error;
    }
  },

  // ✅ Thêm các hàm Admin
 create: (data) => fetchApi('/genres', { method: 'POST', data }),
  update: (id, data) => fetchApi(`/genres/${id}`, { method: 'PATCH', data }),
  delete: (id) => fetchApi(`/genres/${id}`, { method: 'DELETE' }),
};