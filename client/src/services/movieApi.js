import { fetchApi } from './api';

export const movieApi = {
  // Lấy danh sách tất cả phim
  getAllMovies: async () => {
    try {
      // Gọi API thực tế
      return await fetchApi('/api/movies');
    } catch (error) {
      console.error('Failed to get movies', error);
      throw error;
    }
  },
  
  // Lọc và tìm kiếm phim
  filterMovies: async (params = {}) => {
    try {
      // Chuyển object params thành query string (ví dụ: ?keyword=batman&genreIds=1,2)
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/movies/filter?${queryString}` : '/api/movies/filter';
      return await fetchApi(url);
    } catch (error) {
      console.error('Failed to filter movies', error);
      throw error;
    }
  }
};
