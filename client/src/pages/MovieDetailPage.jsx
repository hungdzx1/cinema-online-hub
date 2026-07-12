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

  // Find active episode video url
  const activeEpisode = useMemo(() => {
    if (!data?.episodes || data.episodes.length === 0) return null;
    return data.episodes.find(ep => ep.episodeNumber === activeEpisodeNumber) || data.episodes[0];
  }, [data, activeEpisodeNumber]);

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
            <VideoPlayer
              movieSlug={movie.slug}
              embedUrl={activeEpisode?.embedUrl}
              currentEpisodeNumber={activeEpisodeNumber}
              totalEpisodes={movie.totalEpisodes || episodes.length}
              onSelectEpisode={handleSelectEpisode}
            />
            
            <EpisodeNavigation
              currentEpisodeNumber={activeEpisodeNumber}
              totalEpisodes={movie.totalEpisodes || episodes.length}
              onSelectEpisode={handleSelectEpisode}
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
              {/* Episodes listing */}
              <EpisodeGrid 
                episodes={episodes}
                activeEpisodeNumber={activeEpisode?.episodeNumber || 1}
                onSelectEpisode={handleSelectEpisode}
                movieType={movie.type}
              />

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
