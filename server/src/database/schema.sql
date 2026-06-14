<<<<<<< HEAD
// Hưng
=======
-- 1. BẢNG NGƯỜI DÙNG

USE web_xem_phim;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    role VARCHAR(20) DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (role IN ('USER', 'ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. BẢNG QUỐC GIA
CREATE TABLE IF NOT EXISTS countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. BẢNG THỂ LOẠI
CREATE TABLE IF NOT EXISTS genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. BẢNG PHIM (Cốt lõi)
>>>>>>> 1b6f2ad (up sql)
CREATE TABLE IF NOT EXISTS movies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    poster_url VARCHAR(255),
    backdrop_url VARCHAR(255),
    trailer_url VARCHAR(255),
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    release_year INT,
    country_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (type IN ('SINGLE', 'SERIES')),
    CHECK (status IN ('ONGOING', 'COMPLETED', 'TRAILER')),
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

<<<<<<< HEAD
// Hùng
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    role VARCHAR(20) DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (role IN ('USER', 'ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


INSERT INTO episodes (id, movie_id, episode_number, title, embed_url, server_name, duration_seconds) VALUES
('e1111111-1111-1111-1111-111111111111', 'm1111111-1111-1111-1111-111111111111', 1, 'Tập Full', 'https://player.com/mai-full', 'VIP Server', 7200),
('e2222222-2222-2222-2222-222222222222', 'm2222222-2222-2222-2222-222222222222', 1, 'Tập 1: Sự biến mất', 'https://player.com/st-ep1', 'Server 1', 3600),
('e3333333-3333-3333-3333-333333333333', 'm2222222-2222-2222-2222-222222222222', 2, 'Tập 2: Kẻ lạ mặt', 'https://player.com/st-ep2', 'Server 1', 3500);


INSERT INTO users (id, email, password_hash, full_name, avatar_url, role) VALUES
('u1111111-1111-1111-1111-111111111111', 'admin@phimhay.com', 'hashed_password_123', 'Quản Trị Viên', 'https://domain.com/admin.jpg', 'ADMIN'),
('u2222222-2222-2222-2222-222222222222', 'khachhang@gmail.com', 'hashed_password_456', 'Nguyễn Văn User', 'https://domain.com/user.jpg', 'USER');
=======
-- 5. BẢNG TRUNG GIAN PHIM - THỂ LOẠI
CREATE TABLE IF NOT EXISTS movie_genres (
    movie_id VARCHAR(36),
    genre_id INT,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. BẢNG TẬP PHIM
CREATE TABLE IF NOT EXISTS episodes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    movie_id VARCHAR(36),
    episode_number INT NOT NULL,
    title VARCHAR(255) NULL,
    embed_url VARCHAR(500) NOT NULL,
    server_name VARCHAR(100) NULL DEFAULT 'Server 1',
    skip_intro_seconds INT NOT NULL DEFAULT 0,
    duration_seconds INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE (movie_id, episode_number, server_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. BẢNG BÌNH LUẬN
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    movie_id VARCHAR(36),
    parent_id VARCHAR(36),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. BẢNG ĐÁNH GIÁ
CREATE TABLE IF NOT EXISTS ratings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    movie_id VARCHAR(36),
    score DECIMAL(3,1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (score >= 1 AND score <= 10),
    UNIQUE (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. BẢNG YÊU THÍCH
CREATE TABLE IF NOT EXISTS favorites (
    user_id VARCHAR(36),
    movie_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. BẢNG DANH SÁCH XEM SAU
CREATE TABLE IF NOT EXISTS watchlist (
    user_id VARCHAR(36),
    movie_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. BẢNG LỊCH SỬ XEM PHIM
CREATE TABLE IF NOT EXISTS watch_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    movie_id VARCHAR(36),
    episode_id VARCHAR(36),
    watched_seconds INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (user_id, episode_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. BẢNG BÁO LỖI
CREATE TABLE IF NOT EXISTS error_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NULL,
    movie_id VARCHAR(36),
    episode_id VARCHAR(36),
    issue_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('PENDING', 'RESOLVED', 'IGNORED')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. BẢNG THÔNG BÁO
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


USE web_xem_phim;

-- --------------------------------------------------------
-- 1. THÊM NGƯỜI DÙNG (Dùng UUID tĩnh để dễ liên kết)
-- --------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, avatar_url, role) VALUES
('u1111111-1111-1111-1111-111111111111', 'admin@phimhay.com', 'hashed_password_123', 'Quản Trị Viên', 'https://domain.com/admin.jpg', 'ADMIN'),
('u2222222-2222-2222-2222-222222222222', 'khachhang@gmail.com', 'hashed_password_456', 'Nguyễn Văn User', 'https://domain.com/user.jpg', 'USER');

-- --------------------------------------------------------
-- 2. THÊM QUỐC GIA (Dùng Auto Increment)
-- --------------------------------------------------------
INSERT INTO countries (id, name, code) VALUES
(1, 'Việt Nam', 'VN'),
(2, 'Mỹ', 'US'),
(3, 'Hàn Quốc', 'KR');

-- --------------------------------------------------------
-- 3. THÊM THỂ LOẠI (Dùng Auto Increment)
-- --------------------------------------------------------
INSERT INTO genres (id, name, slug) VALUES
(1, 'Hành Động', 'hanh-dong'),
(2, 'Tình Cảm', 'tinh-cam'),
(3, 'Khoa Học Viễn Tưởng', 'khoa-hoc-vien-tuong'),
(4, 'Kinh Dị', 'kinh-di');

-- --------------------------------------------------------
-- 4. THÊM PHIM (Liên kết tới country_id)
-- --------------------------------------------------------
INSERT INTO movies (id, title, slug, description, poster_url, backdrop_url, trailer_url, type, status, release_year, country_id) VALUES
('m1111111-1111-1111-1111-111111111111', 'Mai', 'mai-2024', 'Phim điện ảnh tình cảm gia đình...', 'mai-poster.jpg', 'mai-bg.jpg', 'youtube.com/mai', 'SINGLE', 'COMPLETED', 2024, 1),
('m2222222-2222-2222-2222-222222222222', 'Stranger Things', 'stranger-things', 'Một nhóm bạn trẻ khám phá thế giới song song...', 'st-poster.jpg', 'st-bg.jpg', 'youtube.com/st', 'SERIES', 'ONGOING', 2022, 2);

-- --------------------------------------------------------
-- 5. THÊM THỂ LOẠI CHO PHIM (Bảng trung gian Nhiều - Nhiều)
-- --------------------------------------------------------
INSERT INTO movie_genres (movie_id, genre_id) VALUES
('m1111111-1111-1111-1111-111111111111', 2), -- Phim Mai -> Tình Cảm
('m2222222-2222-2222-2222-222222222222', 1), -- Stranger Things -> Hành Động
('m2222222-2222-2222-2222-222222222222', 3), -- Stranger Things -> Khoa học viễn tưởng
('m2222222-2222-2222-2222-222222222222', 4); -- Stranger Things -> Kinh dị

-- --------------------------------------------------------
-- 6. THÊM TẬP PHIM
-- --------------------------------------------------------
INSERT INTO episodes (id, movie_id, episode_number, title, embed_url, server_name, duration_seconds) VALUES
('e1111111-1111-1111-1111-111111111111', 'm1111111-1111-1111-1111-111111111111', 1, 'Tập Full', 'https://player.com/mai-full', 'VIP Server', 7200),
('e2222222-2222-2222-2222-222222222222', 'm2222222-2222-2222-2222-222222222222', 1, 'Tập 1: Sự biến mất', 'https://player.com/st-ep1', 'Server 1', 3600),
('e3333333-3333-3333-3333-333333333333', 'm2222222-2222-2222-2222-222222222222', 2, 'Tập 2: Kẻ lạ mặt', 'https://player.com/st-ep2', 'Server 1', 3500);

-- --------------------------------------------------------
-- 7. THÊM BÌNH LUẬN (User bình luận vào Phim Mai)
-- --------------------------------------------------------
INSERT INTO comments (id, user_id, movie_id, content) VALUES
('c1111111-1111-1111-1111-111111111111', 'u2222222-2222-2222-2222-222222222222', 'm1111111-1111-1111-1111-111111111111', 'Phim hay quá, xem khóc luôn ạ!');

-- --------------------------------------------------------
-- 8. THÊM ĐÁNH GIÁ (User đánh giá phim Stranger Things 9.5 điểm)
-- --------------------------------------------------------
INSERT INTO ratings (id, user_id, movie_id, score) VALUES
('r1111111-1111-1111-1111-111111111111', 'u2222222-2222-2222-2222-222222222222', 'm2222222-2222-2222-2222-222222222222', 9.5);

-- --------------------------------------------------------
-- 9. THÊM VÀO YÊU THÍCH & XEM SAU
-- --------------------------------------------------------
INSERT INTO favorites (user_id, movie_id) VALUES
('u2222222-2222-2222-2222-222222222222', 'm2222222-2222-2222-2222-222222222222');

INSERT INTO watchlist (user_id, movie_id) VALUES
('u2222222-2222-2222-2222-222222222222', 'm1111111-1111-1111-1111-111111111111');

-- --------------------------------------------------------
-- 10. THÊM LỊCH SỬ XEM PHIM (Đang xem Mai đến phút 45 = 2700 giây)
-- --------------------------------------------------------
INSERT INTO watch_history (id, user_id, movie_id, episode_id, watched_seconds) VALUES
('w1111111-1111-1111-1111-111111111111', 'u2222222-2222-2222-2222-222222222222', 'm1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 2700);

-- --------------------------------------------------------
-- 11. THÊM BÁO LỖI & THÔNG BÁO
-- --------------------------------------------------------
INSERT INTO error_reports (id, user_id, movie_id, episode_id, issue_type, description) VALUES
('er111111-1111-1111-1111-111111111111', 'u2222222-2222-2222-2222-222222222222', 'm2222222-2222-2222-2222-222222222222', 'e3333333-3333-3333-3333-333333333333', 'LỖI VIETSUB', 'Tập này sub bị lệch 5 giây admin ơi!');

INSERT INTO notifications (id, user_id, title, content, type) VALUES
('n1111111-1111-1111-1111-111111111111', 'u2222222-2222-2222-2222-222222222222', 'Cập nhật phim mới', 'Stranger Things vừa ra mắt tập 2, xem ngay!', 'NEW_EPISODE');
>>>>>>> 1b6f2ad (up sql)
