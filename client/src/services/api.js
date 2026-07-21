import axios from 'axios';

// Chú ý: Điền URL của backend vào biến BASE_URL này.
// Thông thường lấy từ process.env hoặc import.meta.env, ở đây tạm hardcode hoặc để trống.
export const BASE_URL = 'https://glowing-space-telegram-77pr6p54vvcrw5w-3000.app.github.dev'; // ĐIỀN BASE URL CỦA BẠN VÀO ĐÂY

// Khởi tạo instance của axios với các cài đặt chung
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm gọi API cơ bản (vẫn giữ tên cũ để khỏi sửa các file khác)
export const fetchApi = async (endpoint, options = {}) => {
  try {
    const response = await apiClient(endpoint, options);
    // Axios tự động parse JSON và nhét vào response.data
    return response.data;
  } catch (error) {
    console.error('Axios API failed:', error);
    throw error;
  }
};
