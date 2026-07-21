import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { TrendingCarousel } from '../components/home/TrendingCarousel';
import { movieApi } from '../services/movieApi';
import '../components/home/home.css';

// Component Hero Banner (Khung to tự chuyển slide)
const Hero = ({ movies }) => {
  const [index, setIndex] = useState(0);
  const slides = movies.slice(0, 5); // Lấy 5 phim đầu làm slide

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000); // Chuyển slide mỗi 6 giây
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const movie = slides[index];

  const backdropUrl = movie.bannerUrl || movie.posterUrl;
  const typeText = movie.type === 'phim_bo' ? 'Phim Bộ' : movie.type === 'phim_le' ? 'Phim Lẻ' : 'Phim';

  return (
    <div className="hero-banner-wrapper" style={{ backgroundImage: `url(${backdropUrl})` }}>
      <div className="hero-overlay"></div>
      <div className="hero-content" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 40px' }}>
        <span className="hero-tag">🔥 TOP THỊNH HÀNH</span>
        <h1 className="hero-title">{movie.title}</h1>
        <div className="hero-meta">
          {movie.avgRating > 0 && (
            <span className="meta-tag warning-tag">★ {Number(movie.avgRating).toFixed(1)}</span>
          )}
          {movie.releaseYear && <span className="meta-tag">{movie.releaseYear}</span>}
          <span className="meta-tag primary-tag">{typeText}</span>
        </div>
        {movie.description && (
          <p className="hero-description">{movie.description}</p>
        )}
        <div className="hero-actions">
          <Link to={`/movie/${movie.slug}/watch?episode=1`} className="hero-btn-play">
            ▶ Xem Ngay
          </Link>
          <Link to={`/movie/${movie.slug}`} className="hero-btn-secondary">
            Chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export const HomePage = () => {
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Lấy 30 phim đầu tiên để chia các dải
        const response = await movieApi.filterMovies({ limit: 30, sortBy: 'views' });
        const moviesData = response?.data || [];
        setAllMovies(moviesData);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Hàm lọc phim theo slug thể loại
  const filterByGenre = (slug) => allMovies.filter(m => 
    m.genres?.some(g => g.slug === slug)
  );

  // Chia các mảng phim cho các dải
  const heroMovies = allMovies.slice(0, 5); // Dành cho Hero Banner
  const trendingMovies = allMovies.slice(0, 10); // Dải thịnh hành có hiện số 1,2,3
  const actionMovies = filterByGenre('hanh-dong').slice(0, 10);
  const romanceMovies = filterByGenre('tinh-cam').slice(0, 10);
  const comedyMovies = filterByGenre('hai-huoc').slice(0, 10);
  const animeMovies = filterByGenre('hoat-hinh').slice(0, 10);
  
  // Dải phim thanh xuân
  const youthMovies = filterByGenre('hoc-duong').length > 0 
    ? filterByGenre('hoc-duong').slice(0, 10) 
    : allMovies.slice(10, 20);

  if (loading) {
    return (
      <MainLayout>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          Đang tải dữ liệu phim...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* ===== 1. HERO BANNER TO (Tự chuyển slide) ===== */}
      <Hero movies={heroMovies} />

      {/* ===== 2. CÁC DẢI PHIM (Full width, có nút mũi tên) ===== */}
      <div style={{ paddingTop: '20px' }}>
        {/* Dải Thịnh Hành có hiện số thứ tự (showRank=true) */}
        <TrendingCarousel title="🔥 ĐANG THỊNH HÀNH" movies={trendingMovies} showRank={true} />
        
        {/* Các dải chủ đề không hiện số thứ tự */}
        <TrendingCarousel title="💥 Phim Hành Động Nóng Bỏng" movies={actionMovies} />
        <TrendingCarousel title="💖 Phim Chữa Lành Tâm Hồn" movies={romanceMovies} />
        <TrendingCarousel title="😂 Phim Hài Hước Giải Trí" movies={comedyMovies} />
        <TrendingCarousel title="🌸 Phim Hoạt Hình & Anime" movies={animeMovies} />
        <TrendingCarousel title="🎓 Phim Thanh Xuân Vườn Trường" movies={youthMovies} />
      </div>
    </MainLayout>
  );
};