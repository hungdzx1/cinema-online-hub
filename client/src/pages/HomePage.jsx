import { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { TrendingSection } from '../components/home/TrendingSection';
import { ScheduleTabs } from '../components/home/ScheduleTabs';
import { movieApi } from '../services/movieApi';

export const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await movieApi.getAllMovies();
        setMovies(data);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <MainLayout>
      {/* Khối Trending - Thịnh Hành */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Đang tải dữ liệu phim...
        </div>
      ) : (
        <TrendingSection movies={movies} />
      )}

      {/* Lịch chiếu phim */}
      <ScheduleTabs />
    </MainLayout>
  );
};
