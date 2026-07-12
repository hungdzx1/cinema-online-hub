import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { TrendingCarousel } from '../components/home/TrendingCarousel';
import { CategoryFilter } from '../components/home/CategoryFilter';
import { MovieGrid } from '../components/home/MovieGrid';
import { movieApi } from '../services/movieApi';
import { genreApi } from '../services/genreApi';

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page')) || 1;
  const categoryParam = searchParams.get('category') || null;

  const [genres, setGenres] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loadingFiltered, setLoadingFiltered] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  const gridRef = useRef(null);

  // Fetch initial data: Genres and Trending Movies
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingTrending(true);
        const topMoviesData = await movieApi.filterMovies({ sortBy: 'views', limit: 10 });
        setTrendingMovies(topMoviesData.data || []);
        
        const genresData = await genreApi.getAll();
        setGenres(genresData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchInitialData();
  }, []);

  // Update URL when category changes
  const handleSelectCategory = (genre) => {
    if (genre) {
      setSearchParams({ category: genre.slug, page: 1 });
    } else {
      setSearchParams({ page: 1 });
    }
  };

  // Update URL when page changes
  const handlePageChange = (newPage) => {
    const newParams = { page: newPage };
    if (categoryParam) newParams.category = categoryParam;
    setSearchParams(newParams);
    
    // Cuộn lên đầu danh sách phim
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Fetch movies when category or page changes
  useEffect(() => {
    // Wait until genres are loaded to map slug to ID, unless no category is selected
    if (categoryParam && genres.length === 0) return;

    const fetchMoviesByCategory = async () => {
      try {
        setLoadingFiltered(true);
        let activeGenreId = null;

        if (categoryParam) {
          const found = genres.find(g => g.slug === categoryParam);
          if (found) activeGenreId = found.id;
        }

        const params = {
          limit: 15,
          page: pageParam,
          ...(activeGenreId ? { genreIds: [activeGenreId] } : {})
        };
        
        const data = await movieApi.filterMovies(params);
        setFilteredMovies(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching filtered movies:", error);
      } finally {
        setLoadingFiltered(false);
      }
    };

    fetchMoviesByCategory();
  }, [categoryParam, pageParam, genres]);

  return (
    <MainLayout>
      {/* Khối Trending - Thịnh Hành (Carousel) */}
      {loadingTrending ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Đang tải dữ liệu phim thịnh hành...
        </div>
      ) : (
        <TrendingCarousel movies={trendingMovies} />
      )}

      {/* Bộ lọc thể loại phim */}
      <CategoryFilter 
        genres={genres} 
        activeCategorySlug={categoryParam} 
        onSelectCategory={handleSelectCategory} 
      />

      {/* Lưới phim theo thể loại */}
      <div ref={gridRef}>
        <MovieGrid 
          movies={filteredMovies} 
          loading={loadingFiltered} 
          currentPage={pageParam}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </MainLayout>
  );
};



