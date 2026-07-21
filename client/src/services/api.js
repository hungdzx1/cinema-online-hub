import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'https://psychic-yodel-g47gqxp457v4fpgrx-3000.app.github.dev';

// Khởi tạo instance của axios với các cài đặt chung
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn token Authorization vào mọi request nếu có
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cinema_access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Hàm gọi API cơ bản
export const fetchApi = async (endpoint, options = {}) => {
  try {
    const response = await apiClient(endpoint, options);
    return response.data;
  } catch (error) {
    console.error('Axios API failed:', error);
    throw error;
  }
};
