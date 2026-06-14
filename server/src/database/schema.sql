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
CREATE TABLE IF NOT EXISTS episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id ID REFERENCES movies(id) ON DELETE CASCADE,
    episode_number int not null,
    title varchar(255) NULL,
    embed_url varchar(500) not null,
    sever_name varchar(100) null default 'Sever 1';
    skip_intro_seconds int not null default 0,
    duration_seconds int not null default 0,
    view_count INT not null DEFAULT 0,
    created_at DATETIME not null default CURRENT_TIMESTAMP,
    updated_at DATETIME not null default CURRENT_TIMESTAMP on update  CURRENT_TIMESTAMP ,
    CONSTRAINT fk_episode_movie foreign key (movie_id) references movie(id) on ON DELETE CASCADE,
  UNIQUE KEY uq_episode (movie_id, episode_number, server_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO episodes (id, movie_id, episode_number, title, embed_url, server_name, duration_seconds) VALUES
('e1111111-1111-1111-1111-111111111111', 'm1111111-1111-1111-1111-111111111111', 1, 'Tập Full', 'https://player.com/mai-full', 'VIP Server', 7200),
('e2222222-2222-2222-2222-222222222222', 'm2222222-2222-2222-2222-222222222222', 1, 'Tập 1: Sự biến mất', 'https://player.com/st-ep1', 'Server 1', 3600),
('e3333333-3333-3333-3333-333333333333', 'm2222222-2222-2222-2222-222222222222', 2, 'Tập 2: Kẻ lạ mặt', 'https://player.com/st-ep2', 'Server 1', 3500);


INSERT INTO movies (id, title, slug, description, poster_url, backdrop_url, trailer_url, type, status, release_year, country_id) VALUES
('m1111111-1111-1111-1111-111111111111', 'Mai', 'mai-2024', 'Phim điện ảnh tình cảm gia đình...', 'mai-poster.jpg', 'mai-bg.jpg', 'youtube.com/mai', 'SINGLE', 'COMPLETED', 2024, 1),
('m2222222-2222-2222-2222-222222222222', 'Stranger Things', 'stranger-things', 'Một nhóm bạn trẻ khám phá thế giới song song...', 'st-poster.jpg', 'st-bg.jpg', 'youtube.com/st', 'SERIES', 'ONGOING', 2022, 2);
