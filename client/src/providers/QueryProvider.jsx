import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../lib/queryClient';

// ============================================================
// QueryProvider — bọc toàn app để MỌI component dùng được TanStack Query
// Tương đương phần <QueryClientProvider> trong slide cô, nhưng tách riêng
// ra 1 file cho gọn (slide cô gộp thẳng trong App).
// ============================================================
export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools: bảng debug query (chỉ hiện khi dev, tự ẩn khi build thật) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
