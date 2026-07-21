import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { MovieCard } from '../components/common/MovieCard';
import { movieApi } from '../services/movieApi';
import { genreApi } from '../services/genreApi';
import { countryApi } from '../services/countryApi';
import './search.css';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract search params from URL
  const keyword = searchParams.get('keyword') || '';
  const genreIdsParam = searchParams.get('genreIds') || '';
  const countryParam = searchParams.get('country') || '';
  const typeParam = searchParams.get('type') || '';
  const statusParam = searchParams.get('status') || '';
  const sortByParam = searchParams.get('sortBy') || 'newest';

  const selectedGenreIds = useMemo(() => {
    return genreIdsParam ? genreIdsParam.split(',').map(Number).filter(n => !isNaN(n)) : [];
  }, [genreIdsParam]);

  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch genres & countries
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [genresData, countriesData] = await Promise.all([
          genreApi.getAll().catch(() => []),
          countryApi.getAll().catch(() => []),
        ]);
        setGenres(Array.isArray(genresData) ? genresData : []);
        setCountries(Array.isArray(countriesData) ? countriesData : []);
      } catch (error) {
        console.error('Lỗi khi tải thể loại/quốc gia:', error);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch filtered movies on URL parameter changes
  useEffect(() => {
    const fetchFilteredMovies = async () => {
      setLoading(true);
      try {
        const params = {};
        if (keyword) params.keyword = keyword;
        if (genreIdsParam) params.genreIds = genreIdsParam;
        if (countryParam) params.country = countryParam;
        if (typeParam) params.type = typeParam;
        if (statusParam) params.status = statusParam;
        if (sortByParam) params.sortBy = sortByParam;

        const result = await movieApi.filterMovies(params);
        if (result && result.data) {
          setMovies(result.data);
        } else if (Array.isArray(result)) {
          setMovies(result);
        } else {
          setMovies([]);
        }
      } catch (error) {
        console.error('Lỗi khi lọc phim:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredMovies();
  }, [keyword, genreIdsParam, countryParam, typeParam, statusParam, sortByParam]);

  // Update query params helper
  const updateQueryParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleGenreToggle = (genreId) => {
    const newSelected = selectedGenreIds.includes(genreId)
      ? selectedGenreIds.filter(id => id !== genreId)
      : [...selectedGenreIds, genreId];

    updateQueryParam('genreIds', newSelected.length > 0 ? newSelected.join(',') : null);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  // Find active country object
  const activeCountry = useMemo(() => {
    if (!countryParam) return null;
    return countries.find(c => String(c.slug) === String(countryParam) || String(c.id) === String(countryParam));
  }, [countryParam, countries]);

  return (
    <MainLayout>
      <div className="search-page container fade-in">
        <div className="search-layout">

          {/* Sidebar Filters */}
          <aside className="search-sidebar">
            <div className="filter-sidebar-header">
              <h3 className="filter-sidebar-title">Bộ lọc phim</h3>
              {(keyword || genreIdsParam || countryParam || typeParam || statusParam || sortByParam !== 'newest') && (
                <button className="clear-filters-btn" onClick={handleClearFilters}>
                  Xóa lọc
                </button>
              )}
            </div>

            {/* Sắp xếp */}
            <div className="filter-group">
              <h4 className="filter-title">Sắp xếp</h4>
              <select
                className="filter-select"
                value={sortByParam}
                onChange={(e) => updateQueryParam('sortBy', e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="views">Lượt xem nhiều nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>

            {/* Quốc gia */}
            <div className="filter-group">
              <h4 className="filter-title">Quốc gia</h4>
              <select
                className="filter-select"
                value={countryParam}
                onChange={(e) => updateQueryParam('country', e.target.value)}
              >
                <option value="">Tất cả quốc gia</option>
                {countries.map(c => (
                  <option key={c.id} value={c.slug || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Loại phim */}
            <div className="filter-group">
              <h4 className="filter-title">Loại phim</h4>
              <select
                className="filter-select"
                value={typeParam}
                onChange={(e) => updateQueryParam('type', e.target.value)}
              >
                <option value="">Tất cả loại phim</option>
                <option value="phim_le">Phim Lẻ</option>
                <option value="phim_bo">Phim Bộ</option>
                <option value="hoat_hinh">Hoạt Hình</option>
                <option value="anime">Anime</option>
              </select>
            </div>

            {/* Trạng thái */}
            <div className="filter-group">
              <h4 className="filter-title">Trạng thái</h4>
              <select
                className="filter-select"
                value={statusParam}
                onChange={(e) => updateQueryParam('status', e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ongoing">Đang chiếu</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>

            {/* Thể loại */}
            <div className="filter-group">
              <h4 className="filter-title">Thể loại ({genres.length})</h4>
              <div className="filter-list">
                {genres.map(genre => (
                  <label key={genre.id} className="filter-label">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={selectedGenreIds.includes(genre.id)}
                      onChange={() => handleGenreToggle(genre.id)}
                    />
                    {genre.name}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Content results */}
          <section className="search-content">
            <div className="search-header">
              <h2 className="search-title">
                {keyword ? (
                  <>Kết quả tìm kiếm cho: <span className="keyword">"{keyword}"</span></>
                ) : activeCountry ? (
                  <>Phim quốc gia: <span className="keyword">{activeCountry.name}</span></>
                ) : typeParam ? (
                  <>Danh sách phim <span className="keyword">{typeParam === 'phim_bo' ? 'Bộ' : typeParam === 'phim_le' ? 'Lẻ' : typeParam === 'hoat_hinh' ? 'Hoạt hình' : 'Anime'}</span></>
                ) : statusParam ? (
                  <>Phim <span className="keyword">{statusParam === 'ongoing' ? 'Đang chiếu' : 'Hoàn thành'}</span></>
                ) : sortByParam === 'rating' || sortByParam === 'imdb' ? (
                  <>Danh sách phim <span className="keyword">Đánh Giá Cao</span></>
                ) : (
                  'Lọc danh sách phim'
                )}
              </h2>

              <div className="search-results-info">
                Tìm thấy <strong>{movies.length}</strong> bộ phim phù hợp
              </div>
            </div>

            {loading ? (
              <div className="loading-state">Đang tải danh sách phim...</div>
            ) : movies.length > 0 ? (
              <div className="movies-grid">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h3>Không tìm thấy bộ phim phù hợp</h3>
                <p>Hãy thử chọn thể loại khác hoặc bấm nút "Xóa lọc" để xem lại toàn bộ phim.</p>
                <button className="clear-filters-btn" style={{ marginTop: '16px' }} onClick={handleClearFilters}>
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            )}
          </section>

        </div>
      </div>
    </MainLayout>
  );
};

export default SearchPage;
