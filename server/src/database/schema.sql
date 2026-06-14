// Hưng
CREATE TABLE IF NOT EXISTS movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    poster_url VARCHAR(255),
    backdrop_url VARCHAR(255),
    trailer_url VARCHAR(255),
    type VARCHAR(20) NOT NULL CHECK (type IN ('SINGLE', 'SERIES')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ONGOING', 'COMPLETED', 'TRAILER')),
    release_year INT,
    country_id INT REFERENCES countries(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
