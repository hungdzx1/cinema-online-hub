-- ============================================================
-- PHIMPLAY24 - WEB XEM PHIM TRỰC TUYẾN
-- Cơ sở dữ liệu: MySQL 8 (Aiven Cloud)
-- Nhóm 4
-- ============================================================

-- Dùng bảng mã utf8mb4 để hỗ trợ tiếng Việt + emoji
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. BẢNG NGƯỜI DÙNG (users)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    VARCHAR(255) NULL,
  role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  is_banned     BOOLEAN NOT NULL DEFAULT FALSE,
  last_login    DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. BẢNG REFRESH TOKEN (refresh_tokens) - JWT
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  DATETIME NOT NULL,
  is_revoked  BOOLEAN NOT NULL DEFAULT FALSE,
  user_agent  VARCHAR(255) NULL,
  ip_address  VARCHAR(50)  NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. BẢNG THỂ LOẠI (genres)
-- ============================================================
CREATE TABLE IF NOT EXISTS genres (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. BẢNG QUỐC GIA (countries)
-- ============================================================
CREATE TABLE IF NOT EXISTS countries (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. BẢNG PHIM (movies)
-- ============================================================
CREATE TABLE IF NOT EXISTS movies (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  slug            VARCHAR(280) NOT NULL UNIQUE,
  description     TEXT NULL,
  poster_url      VARCHAR(500) NULL,
  banner_url      VARCHAR(500) NULL,
  type            ENUM('phim_le', 'phim_bo', 'hoat_hinh', 'anime') NOT NULL,
  status          ENUM('ongoing', 'completed', 'upcoming') NOT NULL DEFAULT 'ongoing',
  release_year    INT NULL,
  total_episodes  INT NOT NULL DEFAULT 0,
  view_count      INT NOT NULL DEFAULT 0,
  avg_rating      DECIMAL(3,1) NOT NULL DEFAULT 0,
  rating_count    INT NOT NULL DEFAULT 0,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible      BOOLEAN NOT NULL DEFAULT TRUE,
  schedule_date   DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_movie_title (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. BẢNG TRUNG GIAN PHIM-THỂ LOẠI (movie_genres)
-- ============================================================
CREATE TABLE IF NOT EXISTS movie_genres (
  movie_id INT NOT NULL,
  genre_id INT NOT NULL,
  PRIMARY KEY (movie_id, genre_id),
  CONSTRAINT fk_mg_movie FOREIGN KEY (movie_id)
    REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT fk_mg_genre FOREIGN KEY (genre_id)
    REFERENCES genres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. BẢNG TRUNG GIAN PHIM-QUỐC GIA (movie_countries)
-- ============================================================
CREATE TABLE IF NOT EXISTS movie_countries (
  movie_id   INT NOT NULL,
  country_id INT NOT NULL,
  PRIMARY KEY (movie_id, country_id),
  CONSTRAINT fk_mc_movie FOREIGN KEY (movie_id)
    REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT fk_mc_country FOREIGN KEY (country_id)
    REFERENCES countries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. BẢNG TẬP PHIM (episodes)
-- ============================================================
CREATE TABLE IF NOT EXISTS episodes (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  movie_id            INT NOT NULL,
  episode_number      INT NOT NULL,
  title               VARCHAR(255) NULL,
  embed_url           VARCHAR(500) NOT NULL,
  server_name         VARCHAR(100) NULL DEFAULT 'Server 1',
  skip_intro_seconds  INT NOT NULL DEFAULT 0,
  duration_seconds    INT NOT NULL DEFAULT 0,
  view_count          INT NOT NULL DEFAULT 0,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_episode_movie FOREIGN KEY (movie_id)
    REFERENCES movies(id) ON DELETE CASCADE,
  UNIQUE KEY uq_episode (movie_id, episode_number, server_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. BẢNG BÌNH LUẬN (comments) - có reply qua parent_id
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  movie_id   INT NOT NULL,
  parent_id  INT NULL,
  content    TEXT NOT NULL,
  is_hidden  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_movie FOREIGN KEY (movie_id)
    REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id)
    REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. BẢNG ĐÁNH GIÁ (ratings) - khóa chính kép, UPSERT
-- ============================================================
CREATE TABLE IF NOT EXISTS ratings (
  user_id    INT NOT NULL,
  movie_id   INT NOT NULL,
  score      TINYINT NOT NULL,
  content    TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, movie_id),
  CONSTRAINT fk_rating_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rating_movie FOREIGN KEY (movie_id)
    REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT chk_score CHECK (score >= 1 AND score <= 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. BẢNG YÊU THÍCH (favorites) - khóa chính kép, toggle
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  user_id    INT NOT NULL,
  movie_id   INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, movie_id),
  CONSTRAINT fk_favorite_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorite_movie FOREIGN KEY (movie_id)
    REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. BẢNG THEO DÕI / THƯ VIỆN (watchlist) - khóa chính kép
-- ============================================================
CREATE TABLE IF NOT EXISTS watchlist (
  user_id    INT NOT NULL,
  movie_id   INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, movie_id),
  CONSTRAINT fk_watchlist_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_watchlist_movie FOREIGN KEY (movie_id)
    REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. BẢNG LỊCH SỬ XEM (watch_history) - UPSERT theo user+episode
-- ============================================================
CREATE TABLE IF NOT EXISTS watch_history (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  movie_id         INT NOT NULL,
  episode_id       INT NOT NULL,
  progress_seconds INT NOT NULL DEFAULT 0,
  watched_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_movie FOREIGN KEY (movie_id)
    REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_episode FOREIGN KEY (episode_id)
    REFERENCES episodes(id) ON DELETE CASCADE,
  UNIQUE KEY uq_history (user_id, episode_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. BẢNG BÁO LỖI (error_reports)
-- ============================================================
CREATE TABLE IF NOT EXISTS error_reports (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  movie_id    INT NOT NULL,
  episode_id  INT NULL,
  error_type  ENUM('video_not_load', 'wrong_episode', 'audio_error', 'subtitle_error', 'other') NOT NULL,
  description TEXT NULL,
  status      ENUM('pending', 'resolved', 'ignored') NOT NULL DEFAULT 'pending',
  admin_note  TEXT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_report_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_report_movie FOREIGN KEY (movie_id)
    REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT fk_report_episode FOREIGN KEY (episode_id)
    REFERENCES episodes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. BẢNG THÔNG BÁO (notifications)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  type       ENUM('new_episode', 'system') NOT NULL DEFAULT 'system',
  title      VARCHAR(255) NOT NULL,
  content    TEXT NULL,
  link_url   VARCHAR(500) NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- HẾT - 15 BẢNG
-- ============================================================
