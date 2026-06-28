// ============================================================
// constants.js — HẰNG SỐ dùng chung toàn app.
// Gom 1 chỗ để tránh gõ chuỗi "phim_le", "ongoing"... rải rác (dễ sai chính tả).
// Các giá trị PHẢI khớp đúng enum trong Backend NestJS.
// ============================================================

// --- Loại phim (khớp enum type trong movies.entity Backend) ---
export const MOVIE_TYPE = {
  PHIM_LE: 'phim_le',
  PHIM_BO: 'phim_bo',
  HOAT_HINH: 'hoat_hinh',
  ANIME: 'anime',
};

// Nhãn tiếng Việt để hiển thị (giao diện đọc từ đây)
export const MOVIE_TYPE_LABEL = {
  [MOVIE_TYPE.PHIM_LE]: 'Phim lẻ',
  [MOVIE_TYPE.PHIM_BO]: 'Phim bộ',
  [MOVIE_TYPE.HOAT_HINH]: 'Hoạt hình',
  [MOVIE_TYPE.ANIME]: 'Anime',
};

// --- Trạng thái phim (khớp enum status Backend) ---
export const MOVIE_STATUS = {
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  UPCOMING: 'upcoming',
};

export const MOVIE_STATUS_LABEL = {
  [MOVIE_STATUS.ONGOING]: 'Đang chiếu',
  [MOVIE_STATUS.COMPLETED]: 'Hoàn tất',
  [MOVIE_STATUS.UPCOMING]: 'Sắp chiếu',
};

// --- Tiêu chí sắp xếp cho Bộ lọc (khớp sortBy của filter Backend) ---
export const FILTER_SORT_BY = {
  NEWEST: 'newest',
  IMDB: 'imdb',
  VIEWS: 'views',
};

export const FILTER_SORT_LABEL = {
  [FILTER_SORT_BY.NEWEST]: 'Mới nhất',
  [FILTER_SORT_BY.IMDB]: 'Điểm cao',
  [FILTER_SORT_BY.VIEWS]: 'Lượt xem',
};

// --- Tiêu chí sắp xếp cho Random nâng cao (khớp sortBy random Backend) ---
export const RANDOM_SORT_BY = {
  VIEW: 'view',
  NEW: 'new',
  LIKE: 'like',
  COMMENT: 'comment',
};

// --- Số lượng kết quả cho Random nâng cao (Backend chỉ nhận 5/10/15) ---
export const RANDOM_LIMIT_OPTIONS = [5, 10, 15];

// --- Vai trò người dùng (khớp enum role Backend) ---
export const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
};

// --- Loại lỗi báo cáo (khớp enum error_type Backend) ---
export const ERROR_TYPE = {
  VIDEO_NOT_LOAD: 'video_not_load',
  WRONG_EPISODE: 'wrong_episode',
  AUDIO_ERROR: 'audio_error',
  SUBTITLE_ERROR: 'subtitle_error',
  OTHER: 'other',
};

export const ERROR_TYPE_LABEL = {
  [ERROR_TYPE.VIDEO_NOT_LOAD]: 'Video không tải được',
  [ERROR_TYPE.WRONG_EPISODE]: 'Sai tập phim',
  [ERROR_TYPE.AUDIO_ERROR]: 'Lỗi âm thanh',
  [ERROR_TYPE.SUBTITLE_ERROR]: 'Lỗi phụ đề',
  [ERROR_TYPE.OTHER]: 'Lỗi khác',
};

// --- Khoảng thời gian gửi tiến độ xem lên Backend (mili-giây) ---
// Dùng cho WatchPage: cứ mỗi 15s lưu progress 1 lần.
// Đặt thưa (không phải mỗi giây) để tránh dính Rate Limit (Backend 20 req/60s).
export const WATCH_PROGRESS_SAVE_INTERVAL = 15000;
