import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { movieApi } from '../services/movieApi';
import { useTheme } from '../context/ThemeContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const FALLBACK = 'https://placehold.co/300x450/1a1a22/f59e0b?text=PHIMPLAY24';

// Dữ liệu cứng cho bộ lọc
const GENRES = [
  { id: 1, name: 'Hành Động' }, { id: 2, name: 'Tình Cảm' },
  { id: 3, name: 'Hài Hước' }, { id: 4, name: 'Cổ Trang' },
  { id: 5, name: 'Tâm Lý' }, { id: 6, name: 'Hình Sự' },
  { id: 7, name: 'Chiến Tranh' }, { id: 8, name: 'Thể Thao' },
  { id: 9, name: 'Võ Thuật' }, { id: 10, name: 'Viễn Tưởng' },
  { id: 11, name: 'Phiêu Lưu' }, { id: 12, name: 'Khoa Học' },
  { id: 13, name: 'Kinh Dị' }, { id: 14, name: 'Âm Nhạc' },
  { id: 15, name: 'Thần Thoại' }, { id: 16, name: 'Chính Kịch' },
  { id: 17, name: 'Học Đường' }, { id: 18, name: 'Gia Đình' },
  { id: 19, name: 'Bí Ẩn' }, { id: 20, name: 'Tài Liệu' },
  { id: 21, name: 'Gây Cấn' }, { id: 22, name: 'Lịch Sử' },
  { id: 23, name: 'Hoạt Hình' }, { id: 24, name: 'Kiếm Hiệp' },
  { id: 25, name: 'Khoa Huyễn' }, { id: 26, name: 'Chính Trị' },
  { id: 27, name: 'Kinh Điển' }, { id: 28, name: 'Đời Thường' },
  { id: 29, name: 'Tội Phạm' }, { id: 30, name: 'Siêu Anh Hùng' },
];

const TYPES = [
  { label: 'Phim Lẻ', value: 'phim_le' },
  { label: 'Phim Bộ', value: 'phim_bo' },
  { label: 'Hoạt Hình', value: 'hoat_hinh' },
  { label: 'Anime', value: 'anime' },
];

const STATUSES = [
  { label: 'Đang Chiếu', value: 'ongoing' },
  { label: 'Hoàn Tất', value: 'completed' },
  { label: 'Sắp Chiếu', value: 'upcoming' },
];

const LIMITS = [5, 10, 15];
const SORTS = [
  { label: 'Xem nhiều', value: 'view' },
  { label: 'Mới cập nhật', value: 'new' },
  { label: 'Lượt Like', value: 'like' },
  { label: 'Lượt Bình luận', value: 'comment' },
];

export const RandomPage = () => {
  useDocumentTitle('Gợi Ý Phim Ngẫu Nhiên');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State cho Random Nhanh
  const [quickMovie, setQuickMovie] = useState(null);
  const [loadingQuick, setLoadingQuick] = useState(false);

  // State cho Random Nâng Cao
  const [filters, setFilters] = useState({
    type: null,
    status: null,
    genreIds: [],
    limit: 5,
    sortBy: 'view',
  });
  const [advMovies, setAdvMovies] = useState([]);
  const [loadingAdv, setLoadingAdv] = useState(false);

  // Hàm gọi API Random Nhanh
  const fetchQuickMovie = async () => {
    setLoadingQuick(true);
    try {
      const data = await movieApi.getRandom();
      setQuickMovie(data);
    } catch (error) {
      console.error("Lỗi random nhanh:", error);
    } finally {
      setLoadingQuick(false);
    }
  };

  // Gọi lần đầu khi load trang
  useEffect(() => {
    fetchQuickMovie();
  }, []);

  // Phím tắt R
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key.toLowerCase() === 'r' && !e.target.matches('input, textarea, select')) {
        fetchQuickMovie();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Hàm gọi API Random Nâng Cao
  const fetchAdvMovies = async () => {
    setLoadingAdv(true);
    try {
      const res = await movieApi.getRandomAdvanced(filters);
      setAdvMovies(Array.isArray(res) ? res : (res?.data || []));
    } catch (error) {
      console.error("Lỗi random nâng cao:", error);
    } finally {
      setLoadingAdv(false);
    }
  };

  const toggleGenre = (id) => {
    setFilters((prev) => {
      const exists = prev.genreIds.includes(id);
      if (exists) return { ...prev, genreIds: prev.genreIds.filter((g) => g !== id) };
      if (prev.genreIds.length >= 5) return prev; // Tối đa 5
      return { ...prev, genreIds: [...prev.genreIds, id] };
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const colors = {
    bg: isDark ? '#0b0b0f' : '#ffffff',
    text: isDark ? '#e5e7eb' : '#1f2937',
    headerText: isDark ? '#ffffff' : '#111111',
    subText: isDark ? '#9ca3af' : '#6b7280',
    boxBg: isDark ? '#16171d' : '#f8f9fa',
    border: isDark ? '#2a2b33' : '#e5e7eb',
  };

  return (
    <MainLayout>
      <div style={{ background: colors.bg, color: colors.text, minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 20px 60px' }}>
          
          {/* ===== 1. RANDOM NHANH ===== */}
          <div style={{ marginBottom: 60 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: colors.headerText, marginBottom: 24, textAlign: 'center' }}>
              🎲 Random Phim Nhanh
            </h1>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <button 
                onClick={fetchQuickMovie} 
                disabled={loadingQuick}
                style={{
                  background: '#f59e0b', color: '#000', border: 'none', padding: '12px 32px',
                  borderRadius: 30, fontSize: 16, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.4)', transition: 'transform 0.1s',
                }}
              >
                {loadingQuick ? 'Đang quay...' : 'Quay phim khác'}
              </button>
              <span style={{ marginLeft: 16, alignSelf: 'center', color: colors.subText, fontSize: 14 }}>
                (hoặc nhấn phím R)
              </span>
            </div>

            {/* Thẻ phim Quick Random */}
            {quickMovie && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', background: colors.boxBg,
                border: `1px solid ${colors.border}`, borderRadius: 16, padding: 32, maxWidth: 800, margin: '0 auto',
              }}>
                <Link to={`/movie/${quickMovie.slug}`} style={{ textDecoration: 'none', display: 'flex', gap: 24, width: '100%' }}>
                  <img src={quickMovie.posterUrl || FALLBACK} alt={quickMovie.title} style={{ width: 160, borderRadius: 8, objectFit: 'cover' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: colors.headerText, marginBottom: 8 }}>
                      {quickMovie.title}
                    </h2>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12, color: colors.subText, fontSize: 14 }}>
                      <span style={{ color: '#f5c518', fontWeight: 700 }}>⭐ {Number(quickMovie.avgRating || 0).toFixed(1)}</span>
                      <span>•</span>
                      <span>{quickMovie.releaseYear}</span>
                      <span>•</span>
                      <span style={{ background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                        {quickMovie.status === 'ongoing' ? 'Đang chiếu' : 'Hoàn thành'}
                      </span>
                    </div>
                    <p style={{ color: colors.subText, fontSize: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {quickMovie.description?.replace(/<[^>]+>/g, '') || 'Chưa có mô tả'}
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* ===== 2. RANDOM NÂNG CAO ===== */}
          <div style={{ background: colors.boxBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.headerText, marginBottom: 24, textAlign: 'center' }}>
              🎯 Random Nâng Cao
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 16 }}>
              <FilterGroup title="Loại phim" colors={colors}>
                {TYPES.map((t) => (
                  <FilterChip key={t.value} active={filters.type === t.value} colors={colors} onClick={() => handleFilterChange('type', t.value)}>
                    {t.label}
                  </FilterChip>
                ))}
              </FilterGroup>

              <FilterGroup title="Trạng thái" colors={colors}>
                {STATUSES.map((s) => (
                  <FilterChip key={s.value} active={filters.status === s.value} colors={colors} onClick={() => handleFilterChange('status', s.value)}>
                    {s.label}
                  </FilterChip>
                ))}
              </FilterGroup>
            </div>

            <FilterGroup title={`Thể loại (Tối đa 5 - Đã chọn: ${filters.genreIds.length})`} colors={colors}>
              {GENRES.map((g) => (
                <FilterChip key={g.id} active={filters.genreIds.includes(g.id)} colors={colors} onClick={() => toggleGenre(g.id)}>
                  {g.name}
                </FilterChip>
              ))}
            </FilterGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              <FilterGroup title="Số lượng" colors={colors}>
                {LIMITS.map((l) => (
                  <FilterChip key={l} active={filters.limit === l} colors={colors} onClick={() => setFilters((p) => ({ ...p, limit: l }))}>
                    {l} phim
                  </FilterChip>
                ))}
              </FilterGroup>
              <FilterGroup title="Sắp xếp" colors={colors}>
                {SORTS.map((s) => (
                  <FilterChip key={s.value} active={filters.sortBy === s.value} colors={colors} onClick={() => setFilters((p) => ({ ...p, sortBy: s.value }))}>
                    {s.label}
                  </FilterChip>
                ))}
              </FilterGroup>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <button 
                onClick={fetchAdvMovies} 
                disabled={loadingAdv}
                style={{
                  background: '#ef4444', color: '#fff', border: 'none', padding: '12px 48px',
                  borderRadius: 8, fontSize: 18, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
                }}
              >
                {loadingAdv ? 'Đang quay...' : 'QUAY'}
              </button>
            </div>

            {advMovies?.length > 0 && (
              <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 24 }}>
                <h3 style={{ color: colors.headerText, marginBottom: 16 }}>Kết quả:</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
                  {advMovies.map((m) => (
                    <Link to={`/movie/${m.slug}`} key={m.id} style={{ textDecoration: 'none' }}>
                      <div style={{ position: 'relative', paddingTop: '150%', borderRadius: 8, overflow: 'hidden', background: '#1a1a22' }}>
                        <img src={m.posterUrl || FALLBACK} alt={m.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <h4 style={{ color: colors.headerText, fontSize: 14, marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// --- Components phụ trợ ---
function FilterGroup({ title, colors, children }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: colors.subText, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
    </div>
  );
}

function FilterChip({ active, colors, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 6, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
        border: active ? '1px solid #f59e0b' : `1px solid ${colors.border}`,
        color: active ? '#f59e0b' : colors.subText,
        background: active ? 'rgba(245,158,11,0.1)' : 'transparent',
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}