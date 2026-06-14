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

