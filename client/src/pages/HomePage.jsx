import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { TrendingCarousel } from '../components/home/TrendingCarousel';
import { movieApi } from '../services/movieApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import '../components/home/home.css';

// Component Hero Banner (Chạy video/ảnh nền, có mũi tên và chấm)
const Hero = ({ movies }) => {
  const [index, setIndex] = useState(0);
  const slides = movies.slice(0, 5); // Lấy 5 phim đầu làm slide

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 8000); // Chuyển slide mỗi 8 giây
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const movie = slides[index];

  const backdropUrl = movie.bannerUrl || movie.posterUrl;
  const countryName = movie.countries?.[0]?.name || 'Đang cập nhật';
  const genres = movie.genres?.slice(0, 3) || []; 

  // Link Video nền của bạn
  const youtubeEmbedUrl = "https://v9.streamvsmov.com/video/23246480-2a05-4432-8416-a288ded401be";
  
  // Kiểm tra xem có phải phim "Đặc vụ Kim" không để chạy video
  const isVideoSlide = movie.slug === 'dac-vu-kim-tai-khoi-dong';

  const goNext = () => setIndex((i) => (i + 1) % slides.length);
  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  return (
    <div className="hero-banner-wrapper" style={!isVideoSlide ? { backgroundImage: `url(${backdropUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
      
      {/* LỚP VIDEO NỀN */}
      {isVideoSlide && (
        <iframe 
          className="hero-video-bg" 
          src={youtubeEmbedUrl}
          title="Video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      )}

      {/* Lớp overlay đen mờ để chữ nổi bật */}
      <div className="hero-overlay"></div>
      
      {/* Nút mũi tên trái */}
      <button className="hero-arrow hero-arrow-left" onClick={goPrev} aria-label="Slide trước">
        &#8249;
      </button>
      
      {/* Nút mũi tên phải */}
      <button className="hero-arrow hero-arrow-right" onClick={goNext} aria-label="Slide sau">
        &#8250;
      </button>

      <div className="hero-content" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 40px' }}>
        <span className="hero-tag-top10">TOP {index + 1}</span>
        
        <h1 className="hero-title">{movie.title}</h1>
        
        <div className="hero-meta-info">
          {movie.releaseYear && <span>{movie.releaseYear}</span>}
          <span className="dot-separator">•</span>
          <span>{countryName}</span>
          <span className="dot-separator">•</span>
          <span>{movie.type === 'phim_bo' ? `Tập ${movie.totalEpisodes || 1}` : 'Phim Lẻ'}</span>
        </div>

        <div className="hero-genres">
          {genres.map(g => (
            <span key={g.id} className="hero-genre-pill">{g.name}</span>
          ))}
        </div>

        {movie.description && (
          <p className="hero-description">{movie.description}</p>
        )}
        
        <div className="hero-actions">
          <Link to={`/movie/${movie.slug}/watch?episode=1`} className="hero-btn-play">
            ▶ Xem Ngay
          </Link>
        </div>
      </div>

      {/* Chỉ số trang (Dots) */}
      <div className="hero-dots">
        {slides.map((s, i) => (
          <span 
            key={s.id} 
            className={`hero-dot ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export const HomePage = () => {
  useDocumentTitle('Trang Chủ - Xem Phim Trực Tuyến');
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
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

  const filterByGenre = (slug) => allMovies.filter(m => m.genres?.some(g => g.slug === slug));

  // ✅ HÀM MỚI: Lấy phim theo thể loại, nếu không đủ thì lấy bừa để lấp dải cho đầy
  const getMoviesWithFallback = (slug, fallbackStart, fallbackEnd) => {
    const filtered = filterByGenre(slug).slice(0, 10);
    if (filtered.length >= 4) return filtered; // Nếu có ít nhất 4 phim thể loại đó -> dùng
    return allMovies.slice(fallbackStart, fallbackEnd); // Nếu ít hơn -> lấy bừa phim khác để dải không bị ẩn
  };

  // Chia các mảng phim
  const heroMovies = allMovies.slice(0, 5);
  const trendingMovies = allMovies.slice(0, 10);
  
  // Dùng hàm fallback để đảm bảo LUÔN LUÔN có phim hiện
  const actionMovies = getMoviesWithFallback('hanh-dong', 0, 10);
  const romanceMovies = getMoviesWithFallback('tinh-cam', 10, 20);
  const comedyMovies = getMoviesWithFallback('hai-huoc', 5, 15);
  const horrorMovies = getMoviesWithFallback('kinh-di', 15, 25);
  const animeMovies = getMoviesWithFallback('hoat-hinh', 20, 30);
  const youthMovies = getMoviesWithFallback('hoc-duong', 10, 20);

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
      {/* ===== 1. HERO BANNER TO ===== */}
      <Hero movies={heroMovies} />

      {/* ===== 2. CÁC DẢI PHIM ===== */}
      <div style={{ paddingTop: '20px' }}>
        <TrendingCarousel title="🔥 ĐANG THỊNH HÀNH" movies={trendingMovies} showRank={true} />
        <TrendingCarousel title="💥 Phim Hành Động" movies={actionMovies} />
        <TrendingCarousel title="💖 Phim Tình Cảm" movies={romanceMovies} />
        <TrendingCarousel title="😂 Phim Hài Hước" movies={comedyMovies} />
        <TrendingCarousel title="👻 Phim Kinh Dị - Bí Ẩn" movies={horrorMovies} />
        <TrendingCarousel title="🌸 Phim Hoạt Hình & Anime" movies={animeMovies} />
        <TrendingCarousel title="🎓 Phim Thanh Xuân Vườn Trường" movies={youthMovies} />
      </div>
    </MainLayout>
  );
};