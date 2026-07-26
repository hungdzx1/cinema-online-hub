import { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { TrendingCarousel } from "../components/home/TrendingCarousel";
import { movieApi } from "../services/movieApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "../components/home/home.css";

// Slug của phim "Đặc vụ Kim" — sẽ được đẩy lên TOP 1 của Hero banner
const FEATURED_MOVIE_SLUG = "dac-vu-kim-tai-khoi-dong";

// YouTube video ID dùng làm nền cho slide "Đặc vụ Kim"
const FEATURED_YOUTUBE_ID = "0IIHL2KNSb4";

// Thời lượng hiển thị mỗi slide (ms)
const SLIDE_DURATION_NORMAL = 8000; // Các slide thường: 8 giây
const SLIDE_DURATION_FEATURED = 10000; // Slide Đặc vụ Kim: 10 giây

// Helper: build YouTube embed URL (KHÔNG dùng — giữ lại để tham khảo)
// Không dùng URL embed thuần nữa vì khi cần set playbackRate=2 thì phải dùng
// YT.Player API. Trộn URL embed + new YT.Player(el) trên cùng iframe → lỗi 153
// (player đã load theo URL mode, không thể attach API control vào sau).
const buildFeaturedEmbedUrl = (videoId) =>
  `https://www.youtube.com/embed/${videoId}` +
  `?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1` +
  `&playlist=${videoId}&playsinline=1`;

// Component Hero Banner (Chạy video/ảnh nền, có mũi tên và chấm)
const Hero = ({ movies }) => {
  // ✅ Đẩy phim "Đặc vụ Kim" lên đầu (vị trí #1), giữ các phim còn lại theo thứ tự cũ
  const slides = useMemo(() => {
    if (!Array.isArray(movies) || movies.length === 0) return [];
    const featured = movies.find((m) => m.slug === FEATURED_MOVIE_SLUG);
    if (!featured) return movies.slice(0, 10);
    const rest = movies.filter((m) => m.slug !== FEATURED_MOVIE_SLUG);
    return [featured, ...rest].slice(0, 10);
  }, [movies]);

  const [index, setIndex] = useState(0);

  // ✅ Reset về slide #0 (Đặc vụ Kim) ngay khi danh sách slides thay đổi
  useEffect(() => {
    setIndex(0);
  }, [slides]);

  // ✅ Auto-next: 10s cho slide "Đặc vụ Kim", 8s cho các slide khác
  useEffect(() => {
    if (slides.length <= 1) return;
    const current = slides[index];
    const isFeatured =
      current && current.slug === FEATURED_MOVIE_SLUG;
    const duration = isFeatured
      ? SLIDE_DURATION_FEATURED
      : SLIDE_DURATION_NORMAL;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, duration);
    return () => clearInterval(id);
  }, [slides, index]);

  if (slides.length === 0) return null;
  const movie = slides[index];

  const backdropUrl = movie.bannerUrl || movie.posterUrl;
  const countryName = movie.countries?.[0]?.name || "Đang cập nhật";
  const genres = movie.genres?.slice(0, 3) || [];

  // ✅ Slide "Đặc vụ Kim" → dùng YouTube embed tốc độ 2x
  const isVideoSlide = movie.slug === FEATURED_MOVIE_SLUG;

  const goNext = () => setIndex((i) => (i + 1) % slides.length);
  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  // ✅ Container cho YouTube IFrame API
  // Trước đây mình render <iframe src=...> rồi new YT.Player(el) → lỗi 153
  // (player đã khởi tạo theo URL mode, API không attach được).
  // Fix đúng: render 1 <div> rỗng, để YT.Player tự tạo iframe bên trong,
  // rồi gọi setPlaybackRate(2) trên onReady.
  const ytContainerRef = useRef(null);
  const ytPlayerRef = useRef(null);

  // Cleanup helper — gọn gàng, không throw dù YT API có lỗi
  const cleanupYtPlayer = () => {
    if (ytPlayerRef.current) {
      try { ytPlayerRef.current.destroy(); } catch (e) { /* ignore */ }
      ytPlayerRef.current = null;
    }
    // Clear container để remove iframe sót lại — tránh màn hình đen
    // khi React unmount hoặc khi đổi slide
    if (ytContainerRef.current) {
      try { ytContainerRef.current.innerHTML = ''; } catch (e) { /* ignore */ }
    }
  };

  useEffect(() => {
    if (!isVideoSlide) {
      // Khi chuyển sang slide thường → dọn sạch player YouTube + iframe
      cleanupYtPlayer();
      return;
    }
    if (!ytContainerRef.current) return;

    // Đảm bảo YouTube IFrame API đã load
    const initPlayer = () => {
      if (!ytContainerRef.current) return;
      // Hủy player cũ nếu có + clear DOM
      cleanupYtPlayer();

      try {
        ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
          videoId: FEATURED_YOUTUBE_ID,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            loop: 1,
            playlist: FEATURED_YOUTUBE_ID,
            playsinline: 1,
          },
          events: {
            onReady: (e) => {
              try {
                e.target.setPlaybackRate(2);
                e.target.playVideo();
              } catch (err) {
                /* ignore */
              }
            },
            onError: (e) => {
              console.warn('[Hero] YouTube error code:', e.data);
              if (ytContainerRef.current) {
                ytContainerRef.current.innerHTML = '';
                const fb = document.createElement('iframe');
                fb.src = buildFeaturedEmbedUrl(FEATURED_YOUTUBE_ID);
                fb.className = 'hero-video-bg';
                fb.title = 'Video player';
                fb.frameBorder = '0';
                fb.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                fb.allowFullScreen = true;
                ytContainerRef.current.appendChild(fb);
              }
            },
          },
        });
      } catch (err) {
        console.error('[Hero] YT.Player init failed:', err);
      }
    };

    let attempts = 0;
    const trySetup = () => {
      attempts += 1;
      if (attempts > 50) {
        if (ytContainerRef.current) {
          ytContainerRef.current.innerHTML = '';
          const fb = document.createElement('iframe');
          fb.src = buildFeaturedEmbedUrl(FEATURED_YOUTUBE_ID);
          fb.className = 'hero-video-bg';
          fb.title = 'Video player';
          fb.frameBorder = '0';
          fb.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          fb.allowFullScreen = true;
          ytContainerRef.current.appendChild(fb);
        }
        return;
      }
      if (window.YT && window.YT.Player) {
        initPlayer();
        return;
      }
      setTimeout(trySetup, 200);
    };
    trySetup();

    return () => {
      cleanupYtPlayer();
    };
  }, [isVideoSlide]);

  // ✅ Fallback backdrop: nếu phim không có bannerUrl + posterUrl → dùng gradient đen
  // để không bị màn hình đen đặc khi overlay che lên
  const effectiveBackdrop = backdropUrl || '';
  const heroWrapperStyle = isVideoSlide
    ? {} // Video slide không cần background (video nền sẽ che)
    : effectiveBackdrop
      ? { backgroundImage: `url(${effectiveBackdrop})` }
      : {
          // Fallback gradient khi không có ảnh
          background:
            'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)',
        };

  return (
    <div className="hero-banner-wrapper" style={heroWrapperStyle}>
      {/* LỚP VIDEO NỀN — YouTube embed tốc độ 2x cho slide "Đặc vụ Kim"
          ⚠️ Luôn render div, chỉ ẩn bằng display:none khi không phải video slide.
          Nếu conditional render (isVideoSlide && <div/>), React sẽ unmount div →
          YT.Player.destroy() throw vì DOM đã bị remove → crash component → đen màn hình. */}
      <div
        ref={ytContainerRef}
        className="hero-video-bg-wrapper"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: isVideoSlide ? 'block' : 'none',
        }}
      />

      {/* Lớp overlay đen mờ để chữ nổi bật */}
      <div className="hero-overlay"></div>

      {/* Nút mũi tên trái */}
      <button
        className="hero-arrow hero-arrow-left"
        onClick={goPrev}
        aria-label="Slide trước"
      >
        &#8249;
      </button>

      {/* Nút mũi tên phải */}
      <button
        className="hero-arrow hero-arrow-right"
        onClick={goNext}
        aria-label="Slide sau"
      >
        &#8250;
      </button>

      <div
        className="hero-content"
        style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 40px" }}
      >
        <span className="hero-tag-top10">TOP {index + 1}</span>

        <h1 className="hero-title">{movie.title}</h1>

        <div className="hero-meta-info">
          {movie.releaseYear && <span>{movie.releaseYear}</span>}
          <span className="dot-separator">•</span>
          <span>{countryName}</span>
          <span className="dot-separator">•</span>
          <span>
            {movie.type === "phim_bo"
              ? `Tập ${movie.totalEpisodes || 1}`
              : "Phim Lẻ"}
          </span>
        </div>

        <div className="hero-genres">
          {genres.map((g) => (
            <span key={g.id} className="hero-genre-pill">
              {g.name}
            </span>
          ))}
        </div>

        {movie.description && (
          <p className="hero-description">{movie.description}</p>
        )}

        <div className="hero-actions">
          <Link
            to={`/movie/${movie.slug}/watch?episode=1`}
            className="hero-btn-play"
          >
            ▶ Xem Ngay
          </Link>
        </div>
      </div>

      {/* Chỉ số trang (Dots) */}
      <div className="hero-dots">
        {slides.map((s, i) => (
          <span
            key={s.id}
            className={`hero-dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export const HomePage = () => {
  useDocumentTitle("Trang Chủ - Xem Phim Trực Tuyến");
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const response = await movieApi.filterMovies({
          limit: 30,
          sortBy: "views",
        });
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

  const filterByGenre = (slug) =>
    allMovies.filter((m) => m.genres?.some((g) => g.slug === slug));

  // ✅ HÀM MỚI: Lấy phim theo thể loại, nếu không đủ thì lấy bừa để lấp dải cho đầy
  const getMoviesWithFallback = (slug, fallbackStart, fallbackEnd) => {
    const filtered = filterByGenre(slug).slice(0, 10);
    if (filtered.length >= 4) return filtered; // Nếu có ít nhất 4 phim thể loại đó -> dùng
    return allMovies.slice(fallbackStart, fallbackEnd); // Nếu ít hơn -> lấy bừa phim khác để dải không bị ẩn
  };

  // Chia các mảng phim
  const heroMovies = allMovies.slice(0, 10);
  const trendingMovies = allMovies.slice(0, 10);

  // Dùng hàm fallback để đảm bảo LUÔN LUÔN có phim hiện
  const actionMovies = getMoviesWithFallback("hanh-dong", 0, 10);
  const romanceMovies = getMoviesWithFallback("tinh-cam", 10, 20);
  const comedyMovies = getMoviesWithFallback("hai-huoc", 5, 15);
  const horrorMovies = getMoviesWithFallback("kinh-di", 15, 25);
  const animeMovies = getMoviesWithFallback("hoat-hinh", 20, 30);
  const youthMovies = getMoviesWithFallback("hoc-duong", 10, 20);

  if (loading) {
    return (
      <MainLayout>
        <div
          style={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
          }}
        >
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
      <div style={{ paddingTop: "20px" }}>
        <TrendingCarousel
          title="🔥 ĐANG THỊNH HÀNH"
          movies={trendingMovies}
          showRank={true}
        />
        <TrendingCarousel title="💥 Phim Hành Động" movies={actionMovies} />
        <TrendingCarousel title="💖 Phim Tình Cảm" movies={romanceMovies} />
        <TrendingCarousel title="😂 Phim Hài Hước" movies={comedyMovies} />
        <TrendingCarousel
          title="👻 Phim Kinh Dị - Bí Ẩn"
          movies={horrorMovies}
        />
        <TrendingCarousel
          title="🌸 Phim Hoạt Hình & Anime"
          movies={animeMovies}
        />
        <TrendingCarousel
          title="🎓 Phim Thanh Xuân Vườn Trường"
          movies={youthMovies}
        />
      </div>
    </MainLayout>
  );
};