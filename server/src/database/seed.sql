-- ============================================================
-- SEED DATA - Phimplay24 (khớp schema.sql của nhóm)
-- Admin: admin@phimplay24.com | Password: admin123
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa dữ liệu cũ để seed lại sạch (reset cả AUTO_INCREMENT)
TRUNCATE TABLE episodes;
TRUNCATE TABLE movies;
TRUNCATE TABLE countries;
TRUNCATE TABLE genres;
TRUNCATE TABLE users;


-- ============================================================
-- 1. USERS (admin + demo)
-- ============================================================
INSERT INTO users (username, email, password_hash, role, is_banned) VALUES
('admin', 'admin@phimplay24.com', '$2b$12$FUKHUQJnRh8bA.8PhjKvu.9sZoS56vRc3cXijY8bfwbf5zAVh.N/O', 'admin', 0),
('user_demo', 'user@phimplay24.com', '$2b$12$FUKHUQJnRh8bA.8PhjKvu.9sZoS56vRc3cXijY8bfwbf5zAVh.N/O', 'user', 0);

-- ============================================================
-- 2. GENRES - 30 thể loại
-- ============================================================
INSERT INTO genres (name, slug, is_visible) VALUES
('Hành Động', 'hanh-dong', 1),
('Tình Cảm', 'tinh-cam', 1),
('Hài Hước', 'hai-huoc', 1),
('Cổ Trang', 'co-trang', 1),
('Tâm Lý', 'tam-ly', 1),
('Hình Sự', 'hinh-su', 1),
('Chiến Tranh', 'chien-tranh', 1),
('Thể Thao', 'the-thao', 1),
('Võ Thuật', 'vo-thuat', 1),
('Viễn Tưởng', 'vien-tuong', 1),
('Phiêu Lưu', 'phieu-luu', 1),
('Khoa Học', 'khoa-hoc', 1),
('Kinh Dị', 'kinh-di', 1),
('Âm Nhạc', 'am-nhac', 1),
('Thần Thoại', 'than-thoai', 1),
('Chính Kịch', 'chinh-kich', 1),
('Học Đường', 'hoc-duong', 1),
('Gia Đình', 'gia-dinh', 1),
('Bí Ẩn', 'bi-an', 1),
('Tài Liệu', 'tai-lieu', 1),
('Gây Cấn', 'gay-can', 1),
('Lịch Sử', 'lich-su', 1),
('Hoạt Hình', 'hoat-hinh', 1),
('Kiếm Hiệp', 'kiem-hiep', 1),
('Khoa Huyễn', 'khoa-huyen', 1),
('Chính Trị', 'chinh-tri', 1),
('Kinh Điển', 'kinh-dien', 1),
('Đời Thường', 'doi-thuong', 1),
('Tội Phạm', 'toi-pham', 1),
('Siêu Anh Hùng', 'sieu-anh-hung', 1);

-- ============================================================
-- 3. COUNTRIES - chỉ name + slug (khớp schema, KHÔNG có code)
-- ============================================================
INSERT INTO countries (name, slug) VALUES
('Việt Nam', 'viet-nam'),
('Hàn Quốc', 'han-quoc'),
('Trung Quốc', 'trung-quoc'),
('Nhật Bản', 'nhat-ban'),
('Thái Lan', 'thai-lan'),
('Âu Mỹ', 'au-my'),
('Đài Loan', 'dai-loan'),
('Hồng Kông', 'hong-kong'),
('Ấn Độ', 'an-do'),
('Anh', 'anh');

-- ============================================================
-- 4. MOVIES - 10 phim demo
-- ============================================================
INSERT INTO movies (title, slug, description, poster_url, type, status, release_year, total_episodes, view_count, avg_rating, rating_count, is_featured, is_visible) VALUES
('Mắt Biếc', 'mat-biec', 'Câu chuyện tình yêu đơn phương đẹp và buồn của Ngạn dành cho Hà Lan.', 'https://placehold.co/300x450?text=Mat+Biec', 'phim_le', 'completed', 2019, 0, 15200, 8.5, 1200, 1, 1),
('Bố Già', 'bo-gia', 'Câu chuyện về tình cha con trong một xóm lao động nghèo Sài Gòn.', 'https://placehold.co/300x450?text=Bo+Gia', 'phim_le', 'completed', 2021, 0, 28000, 9.0, 2100, 1, 1),
('Hậu Duệ Mặt Trời', 'hau-due-mat-troi', 'Chuyện tình giữa bác sĩ và quân nhân nơi vùng chiến sự.', 'https://placehold.co/300x450?text=Hau+Due', 'phim_bo', 'completed', 2016, 16, 45000, 8.8, 3500, 1, 1),
('Squid Game', 'squid-game', '456 người chơi tham gia trò chơi sinh tử để giành 45.6 tỷ won.', 'https://placehold.co/300x450?text=Squid+Game', 'phim_bo', 'completed', 2021, 9, 89000, 8.7, 5600, 1, 1),
('Doraemon', 'doraemon', 'Chú mèo máy đến từ tương lai giúp đỡ cậu bé Nobita.', 'https://placehold.co/300x450?text=Doraemon', 'hoat_hinh', 'ongoing', 2005, 500, 67000, 9.2, 4200, 0, 1),
('Thám Tử Lừng Danh Conan', 'conan', 'Thám tử trung học bị teo nhỏ thành cậu bé giải các vụ án.', 'https://placehold.co/300x450?text=Conan', 'anime', 'ongoing', 1996, 1000, 78000, 9.1, 4800, 1, 1),
('Tây Du Ký', 'tay-du-ky', 'Hành trình thỉnh kinh của thầy trò Đường Tăng.', 'https://placehold.co/300x450?text=Tay+Du+Ky', 'phim_bo', 'completed', 1986, 25, 120000, 9.5, 8900, 1, 1),
('Avengers: Endgame', 'avengers-endgame', 'Các siêu anh hùng tập hợp đánh bại Thanos.', 'https://placehold.co/300x450?text=Avengers', 'phim_le', 'completed', 2019, 0, 95000, 8.9, 7200, 1, 1),
('Train to Busan', 'train-to-busan', 'Chuyến tàu sinh tử giữa đại dịch zombie.', 'https://placehold.co/300x450?text=Train+Busan', 'phim_le', 'completed', 2016, 0, 56000, 8.6, 4100, 0, 1),
('One Piece', 'one-piece', 'Hành trình tìm kho báu One Piece của Luffy và băng Mũ Rơm.', 'https://placehold.co/300x450?text=One+Piece', 'anime', 'ongoing', 1999, 1100, 134000, 9.3, 9500, 1, 1);

-- ============================================================
-- 5. EPISODES - tập phim (link YouTube embed mẫu)
-- ============================================================
-- Squid Game (id=4)
INSERT INTO episodes (movie_id, episode_number, title, embed_url, server_name) VALUES
(4, 1, 'Tập 1 - Đèn Đỏ Đèn Xanh', 'https://www.youtube.com/embed/oqxAJKy0ii4', 'Server 1'),
(4, 2, 'Tập 2 - Địa Ngục', 'https://www.youtube.com/embed/oqxAJKy0ii4', 'Server 1'),
(4, 3, 'Tập 3 - Người Cầm Ô', 'https://www.youtube.com/embed/oqxAJKy0ii4', 'Server 1');
-- Hậu Duệ Mặt Trời (id=3)
INSERT INTO episodes (movie_id, episode_number, title, embed_url, server_name) VALUES
(3, 1, 'Tập 1', 'https://www.youtube.com/embed/oqxAJKy0ii4', 'Server 1'),
(3, 2, 'Tập 2', 'https://www.youtube.com/embed/oqxAJKy0ii4', 'Server 1');
-- Mắt Biếc (id=1) - phim lẻ
INSERT INTO episodes (movie_id, episode_number, title, embed_url, server_name) VALUES
(1, 1, 'Full', 'https://www.youtube.com/embed/oqxAJKy0ii4', 'Server 1');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- XONG! admin@phimplay24.com / admin123
-- ============================================================