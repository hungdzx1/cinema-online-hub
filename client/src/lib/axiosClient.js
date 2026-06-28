import axios from 'axios';

// ============================================================
// axiosClient — "cổng ra vào" DUY NHẤT cho mọi request tới Backend
// Mọi file api/ trong các feature đều gọi qua đây, KHÔNG dùng axios trực tiếp.
// ============================================================

// baseURL đọc từ biến môi trường (file .env), fallback về localhost khi dev.
// ⚠️ Vite dùng import.meta.env.VITE_... (KHÔNG phải process.env.REACT_APP_ như CRA)
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 giây — quá thời gian này coi như request thất bại
});

// ============================================================
// REQUEST INTERCEPTOR — chạy TRƯỚC mỗi request gửi đi
// Nhiệm vụ: tự động gắn JWT vào Header, không cần gắn tay ở mỗi lần gọi.
// Đây chính là thứ giải quyết "code tay gắn token" đã bàn ở các buổi trước.
// ============================================================
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================================
// RESPONSE INTERCEPTOR — chạy SAU khi nhận response về
// Nhiệm vụ:
//  - Thành công: trả thẳng phần data (đỡ phải .data ở mọi nơi gọi)
//  - Lỗi 401 (token sai/hết hạn): xóa token cũ, đưa về trang đăng nhập
// ============================================================
axiosClient.interceptors.response.use(
  (response) => response.data, // chỉ lấy phần data, bỏ qua vỏ axios
  (error) => {
    const status = error.response?.status;

    // 401 = chưa đăng nhập / token hỏng / token hết hạn (broken token)
    if (status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      // Chỉ chuyển hướng nếu đang KHÔNG ở trang login (tránh lặp vô hạn)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Ném lỗi tiếp để nơi gọi (hoặc TanStack Query) tự xử lý hiển thị
    return Promise.reject(error);
  },
);

export default axiosClient;
