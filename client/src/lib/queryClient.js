import { QueryClient } from '@tanstack/react-query';

// ============================================================
// queryClient — cấu hình TRUNG TÂM cho TanStack Query (v5)
// Đặt mặc định 1 chỗ, áp dụng cho MỌI query/mutation toàn app.
// (best-practice: cache-defaults — chỉnh 1 nơi thay vì lặp ở từng query)
// ============================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: data được coi là "còn tươi" trong bao lâu.
      // Trong khoảng này, quay lại trang KHÔNG gọi API lại (lấy từ cache).
      // 5 phút hợp với data ít đổi như danh sách phim. (best-practice: cache-stale-time)
      staleTime: 1000 * 60 * 5, // 5 phút

      // gcTime (v5, trước đây tên là cacheTime): giữ cache trong RAM bao lâu
      // SAU KHI không còn component nào dùng nữa, trước khi dọn rác.
      // (best-practice: cache-gc-time)
      gcTime: 1000 * 60 * 30, // 30 phút

      // retry: số lần tự thử lại khi request LỖI (vd mạng chập chờn).
      // 1 lần là đủ cho dự án này, tránh đợi lâu khi server thật sự lỗi.
      // (best-practice: err-retry-config)
      retry: 1,

      // Không tự gọi lại API mỗi khi người dùng click ra/vào lại tab.
      // Tránh gọi thừa; data 5 phút vẫn còn tươi nên không cần.
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Mutation (tạo/sửa/xóa) lỗi thì KHÔNG tự thử lại,
      // tránh lỡ tạo trùng dữ liệu (vd gửi 2 comment giống nhau).
      retry: 0,
    },
  },
});
