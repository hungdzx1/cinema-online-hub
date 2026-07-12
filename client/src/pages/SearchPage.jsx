import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { MovieCard } from '../components/common/MovieCard';
import { movieApi } from '../services/movieApi';
import { genreApi } from '../services/genreApi';
import './search.css';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const genreIdsParam = searchParams.get('genreIds');
  
  const selectedGenreIds = genreIdsParam 
    ? genreIdsParam.split(',').map(Number) 
    : [];

  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách thể loại 1 lần khi load trang
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await genreApi.getAllGenres();
        setGenres(data);
      } catch (error) {
        console.error('Lỗi khi tải danh sách thể loại:', error);
      }
    };
    fetchGenres();
  }, []);

  // Fetch movies mỗi khi URL (keyword hoặc genreIds) thay đổi
  useEffect(() => {
    const fetchFilteredMovies = async () => {
      setLoading(true);
      try {
        const params = {};
        if (keyword) params.keyword = keyword;
        if (genreIdsParam) params.genreIds = genreIdsParam;

        const result = await movieApi.filterMovies(params);
        // Tùy theo API backend trả về array trực tiếp hay object { data, page, hasMore }
        // Dựa vào code backend (movies.service.ts), hàm filterMovies trả về: { data, page, limit, hasMore }
        if (result.data) {
          setMovies(result.data);
        } else if (Array.isArray(result)) {
          setMovies(result);
        }
      } catch (error) {
        console.error('Lỗi khi tìm kiếm phim:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredMovies();
  }, [keyword, genreIdsParam]);

  const handleGenreChange = (genreId) => {
    const newSelected = selectedGenreIds.includes(genreId)
      ? selectedGenreIds.filter(id => id !== genreId)
      : [...selectedGenreIds, genreId];
    
    // Cập nhật lại thanh địa chỉ
    if (newSelected.length > 0) {
      searchParams.set('genreIds', newSelected.join(','));
    } else {
      searchParams.delete('genreIds');
    }
    setSearchParams(searchParams);
  };

  return (
    <MainLayout>
      <div className="search-page container">
        <div className="search-layout">
          
          {/* Cột trái: Bộ lọc (Sidebar) */}
          <aside className="search-sidebar">
            <div className="filter-group">
              <h3 className="filter-title">Thể loại</h3>
              <div className="filter-list">
                {genres.map(genre => (
                  <label key={genre.id} className="filter-label">
                    <input 
                      type="checkbox" 
                      className="filter-checkbox"
                      checked={selectedGenreIds.includes(genre.id)}
                      onChange={() => handleGenreChange(genre.id)}
                    />
                    {genre.name}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Cột phải: Kết quả tìm kiếm */}
          <section className="search-content">
            <div className="search-header">
              <h2 className="search-title">
                {keyword ? (
                  <>Kết quả tìm kiếm cho: <span className="keyword">"{keyword}"</span></>
                ) : (
                  'Lọc phim'
                )}
              </h2>
              <div className="search-results-info">
                Tìm thấy {movies.length} bộ phim phù hợp
              </div>
            </div>

            {loading ? (
              <div className="loading-state">Đang tìm kiếm...</div>
            ) : movies.length > 0 ? (
              <div className="movies-grid">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h3>Không tìm thấy phim nào</h3>
                <p>Hãy thử tìm kiếm với từ khóa khác hoặc bỏ bớt các bộ lọc thể loại.</p>
              </div>
            )}
          </section>

        </div>
      </div>
    </MainLayout>
  );
};
