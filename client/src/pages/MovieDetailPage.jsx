import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { MovieHero } from '../components/movie/MovieHero';
import { MovieInfo } from '../components/movie/MovieInfo';
import { EpisodeGrid } from '../components/movie/EpisodeGrid';
import { RelatedMovies } from '../components/movie/RelatedMovies';
import { CommentSection } from '../components/movie/CommentSection';
import { VideoPlayer } from '../components/movie/player/VideoPlayer';
import { EpisodeNavigation } from '../components/movie/player/EpisodeNavigation';
import { movieApi } from '../services/movieApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import '../components/movie/detail.css';

export const MovieDetailPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isWatchMode = useMemo(() => {
    return location.pathname.endsWith('/watch');
  }, [location.pathname]);

  const activeEpisodeNumber = useMemo(() => {
    return parseInt(searchParams.get('episode'), 10) || 1;
  }, [searchParams]);

  // Cập nhật tiêu đề trang động theo tên phim và tập phim đang xem
  const dynamicTitle = useMemo(() => {
    if (loading) return 'Đang tải thông tin phim...';
    if (error || !data?.movie) return 'Không tìm thấy phim';
    const movieTitle = data.movie.title;
    if (isWatchMode) {
      return `Xem phim ${movieTitle} - Tập ${activeEpisodeNumber}`;
    }
    return `${movieTitle} - Thông tin & Xem phim`;
  }, [loading, error, data, isWatchMode, activeEpisodeNumber]);

  useDocumentTitle(dynamicTitle);

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await movieApi.getDetailBySlug(slug);
        setData(res);
      } catch (err) {
        console.error("Error loading movie details:", err);
        setError("Không thể tải thông tin phim. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();
  }, [slug]);

  // ===== Nhóm episodes theo serverName =====
  // Mỗi server là 1 mảng episode đã sắp xếp theo episodeNumber.
  // VD: { 'Server 1': [...], 'Server 2': [...] }
  const episodesByServer = useMemo(() => {
    if (!data?.episodes || data.episodes.length === 0) return {};
    const map = {};
    data.episodes.forEach((ep) => {
      const key = (ep.serverName || 'Server 1').trim() || 'Server 1';
      if (!map[key]) map[key] = [];
      map[key].push(ep);
    });
    // Sắp xếp mỗi nhóm tăng dần theo episodeNumber
    Object.values(map).forEach((list) => {
      list.sort((a, b) => a.episodeNumber - b.episodeNumber);
    });
    return map;
  }, [data]);

  // Danh sách tên server theo thứ tự xuất hiện đầu tiên trong mảng episodes
  // (để giữ thứ tự tự nhiên thay vì phụ thuộc Object.keys)
  const serverNames = useMemo(() => {
    if (!data?.episodes || data.episodes.length === 0) return [];
    const seen = new Set();
    const ordered = [];
    data.episodes.forEach((ep) => {
      const name = (ep.serverName || 'Server 1').trim() || 'Server 1';
      if (!seen.has(name)) {
        seen.add(name);
        ordered.push(name);
      }
    });
    return ordered;
  }, [data]);

  // ===== activeServer state (persist theo movie slug) =====
  const [activeServer, setActiveServer] = useState(() => {
    return localStorage.getItem(`cinema_server_${slug}`) || '';
  });

  // Khi data tải xong, nếu activeServer chưa có hoặc không nằm trong serverNames → fallback
  useEffect(() => {
    if (serverNames.length === 0) return;
    if (!activeServer || !serverNames.includes(activeServer)) {
      const fallback = serverNames[0];
      setActiveServer(fallback);
      localStorage.setItem(`cinema_server_${slug}`, fallback);
    }
  }, [serverNames, activeServer, slug]);

  // Hàm đổi server — persist vào localStorage
  const handleSelectServer = (serverName) => {
    if (serverName === activeServer) return;
    setActiveServer(serverName);
    localStorage.setItem(`cinema_server_${slug}`, serverName);

    // Nếu server mới không có tập hiện tại → nhảy về tập 1 của server đó
    const list = episodesByServer[serverName] || [];
    const hasCurrentEp = list.some((ep) => ep.episodeNumber === activeEpisodeNumber);
    if (!hasCurrentEp && list.length > 0) {
      const firstEpNum = list[0].episodeNumber;
      setSearchParams({ episode: firstEpNum });
    }
  };

  // Find active episode — chỉ tìm trong server đang chọn
  const activeEpisode = useMemo(() => {
    const list = episodesByServer[activeServer] || [];
    if (list.length === 0) return null;
    return list.find((ep) => ep.episodeNumber === activeEpisodeNumber) || list[0];
  }, [episodesByServer, activeServer, activeEpisodeNumber]);

  // Số tập tối đa trên server đang chọn (dùng cho nút "Tập sau")
  const totalEpisodesActiveServer = useMemo(() => {
    const list = episodesByServer[activeServer] || [];
    return list.length > 0 ? Math.max(...list.map((e) => e.episodeNumber)) : (data?.movie?.totalEpisodes || 1);
  }, [episodesByServer, activeServer, data]);

  const handleSelectEpisode = (episodeNumber) => {
    setSearchParams({ episode: episodeNumber });
    if (!isWatchMode) {
      navigate(`/movie/${slug}/watch?episode=${episodeNumber}`);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: '60px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px', marginBottom: '40px' }}>
            <div className="skeleton-poster" style={{ borderRadius: '12px', height: '400px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="skeleton-text" style={{ width: '60%', height: '32px' }}></div>
              <div className="skeleton-text" style={{ width: '40%', height: '20px' }}></div>
              <div className="skeleton-text" style={{ width: '80%', height: '80px' }}></div>
              <div className="skeleton-text" style={{ width: '30%', height: '40px' }}></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-primary)', marginBottom: '16px' }}>Đã xảy ra lỗi</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error || 'Không tìm thấy dữ liệu phim.'}</p>
          <button className="btn btn-primary" style={{ marginTop: '20px', borderRadius: '20px' }} onClick={() => navigate('/')}>
            Quay về trang chủ
          </button>
        </div>
      </MainLayout>
    );
  }

  const { movie, episodes = [], relatedMovies = [] } = data;

  return (
    <MainLayout>
      {/* 1. Backdrop banner / Hero section (Only in detail view) */}
      {!isWatchMode && <MovieHero movie={movie} episodesCount={episodes.length} />}

      {/* 2. Video Player Section (Only in watch view) */}
      {isWatchMode && (
        <section className="video-player-section">
          <div className="container">
            {/*
              ⚠️ key gồm (server + episodeId) buộc React remount toàn bộ VideoPlayer
              khi user đổi server hoặc đổi tập. Tránh tình trạng state sót lại
              (ytPlayer, isLoading, refs...) khi chuyển giữa YouTube ↔ iframe ↔ HLS
              gây màn hình trắng phải F5 mới hiện lại.
            */}
            <VideoPlayer
              key={`${activeServer}-${activeEpisode?.id ?? activeEpisodeNumber}`}
              movieId={movie.id}
              episodeId={activeEpisode?.id}
              movieSlug={movie.slug}
              embedUrl={activeEpisode?.embedUrl}
              currentEpisodeNumber={activeEpisodeNumber}
              totalEpisodes={totalEpisodesActiveServer}
              onSelectEpisode={handleSelectEpisode}
            />
            
            <EpisodeNavigation
              currentEpisodeNumber={activeEpisodeNumber}
              totalEpisodes={totalEpisodesActiveServer}
              onSelectEpisode={handleSelectEpisode}
              movieId={movie.id}
              episodeId={activeEpisode?.id}
              servers={serverNames}
              activeServer={activeServer}
              onSelectServer={handleSelectServer}
              serverEpisodeCounts={Object.fromEntries(
                serverNames.map((name) => [name, (episodesByServer[name] || []).length])
              )}
              currentEpisodeAvailable={
                (episodesByServer[activeServer] || []).some(
                  (ep) => ep.episodeNumber === activeEpisodeNumber
                )
              }
            />
          </div>
        </section>
      )}

      {/* 3. Detailed specifications grid */}
      <div className="movie-detail-body fade-in">
        <div className="container">
          <div className="movie-detail-grid">
            {/* Left Main contents */}
            <div className="detail-main-col">
              {/* Episodes listing — chỉ hiện tập của server đang chọn để tránh trùng số */}
              <EpisodeGrid
                episodes={episodesByServer[activeServer] || []}
                activeEpisodeNumber={activeEpisode?.episodeNumber || 1}
                onSelectEpisode={handleSelectEpisode}
                movieType={movie.type}
              />
              {/* Subtle hint cho user biết grid này thuộc server nào */}
              {serverNames.length > 1 && (
                <div style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  margin: '-10px 0 14px 4px',
                }}>
                  Hiển thị tập của: <strong style={{ color: 'var(--color-primary)' }}>{activeServer}</strong> · Đổi server ở thanh điều khiển phía trên
                </div>
              )}

              {/* Technical movie info */}
              <MovieInfo movie={movie} />

              {/* Interactive Comments */}
              <CommentSection movieId={movie.id} />
            </div>

            {/* Right sidebar */}
            <div className="detail-sidebar-col">
              <RelatedMovies movies={relatedMovies} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default MovieDetailPage;
