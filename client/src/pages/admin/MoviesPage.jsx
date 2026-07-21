import { useState, useEffect, useMemo } from 'react';
import { movieApi } from '../../services/movieApi';
import { MovieFormModal } from '../../components/admin/MovieFormModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Pagination } from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';
import '../../components/admin/admin.css';

const TYPE_LABELS = { phim_le: 'Phim lẻ', phim_bo: 'Phim bộ', hoat_hinh: 'Hoạt hình', anime: 'Anime' };
const STATUS_LABELS = { ongoing: 'Đang chiếu', completed: 'Hoàn thành', upcoming: 'Sắp chiếu' };
const ITEMS_PER_PAGE = 10;

export const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await movieApi.getAllAdmin();
      setMovies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load movies:', err);
      toast.error('Không thể tải danh sách phim');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovies(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter + Search + Sort
  const processedMovies = useMemo(() => {
    let result = [...movies];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q) || m.slug?.toLowerCase().includes(q));
    }

    // Filter type
    if (filterType) result = result.filter((m) => m.type === filterType);

    // Filter status
    if (filterStatus) result = result.filter((m) => m.status === filterStatus);

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField], valB = b[sortField];
      if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = (valB || '').toLowerCase(); }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [movies, search, filterType, filterStatus, sortField, sortDir]);

  const totalPages = Math.ceil(processedMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = processedMovies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const getSortClass = (field) => {
    if (sortField !== field) return 'sortable';
    return sortDir === 'asc' ? 'sortable sort-asc' : 'sortable sort-desc';
  };

  const openAdd = () => { setEditingMovie(null); setModalOpen(true); };
  const openEdit = (movie) => { setEditingMovie(movie); setModalOpen(true); };

  const handleSaved = () => {
    setModalOpen(false);
    setEditingMovie(null);
    fetchMovies();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await movieApi.delete(deleteTarget.id);
      toast.success(`Đã xóa phim "${deleteTarget.title}"`);
      setDeleteTarget(null);
      fetchMovies();
    } catch {
      toast.error('Xóa phim thất bại');
    }
  };

  if (loading) return <LoadingSpinner text="Đang tải danh sách phim..." />;

  return (
    <div className="movies-admin-page">
      <div className="admin-table-wrapper">
        {/* Toolbar */}
        <div className="admin-table-toolbar">
          <div className="admin-table-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="admin-table-actions">
            <select className="admin-filter-select" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}>
              <option value="">Tất cả loại</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className="admin-filter-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button className="admin-add-btn" onClick={openAdd}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Thêm phim
            </button>
          </div>
        </div>

        {/* Table */}
        {paginatedMovies.length === 0 ? (
          <div className="admin-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /></svg>
            <h3>Không có phim nào</h3>
            <p>Bắt đầu bằng cách thêm phim mới</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Poster</th>
                  <th className={getSortClass('title')} onClick={() => handleSort('title')}>Tiêu đề</th>
                  <th className={getSortClass('type')} onClick={() => handleSort('type')}>Loại phim</th>
                  <th className={getSortClass('releaseYear')} onClick={() => handleSort('releaseYear')}>Năm</th>
                  <th className={getSortClass('status')} onClick={() => handleSort('status')}>Trạng thái</th>
                  <th className={getSortClass('viewCount')} onClick={() => handleSort('viewCount')}>Lượt xem</th>
                  <th className={getSortClass('avgRating')} onClick={() => handleSort('avgRating')}>Điểm</th>
                  <th>Hiển thị</th>
                  <th>Nổi bật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMovies.map((movie) => (
                  <tr key={movie.id}>
                    <td>
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt="" className="admin-table-poster" />
                      ) : (
                        <div className="admin-table-poster" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 11 }}>N/A</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{movie.title}</div>
                    </td>
                    <td><span className={`admin-badge badge-${movie.type?.replace('_', '-')}`}>{TYPE_LABELS[movie.type] || movie.type}</span></td>
                    <td>{movie.releaseYear || '—'}</td>
                    <td><span className={`admin-badge badge-${movie.status}`}>{STATUS_LABELS[movie.status] || movie.status}</span></td>
                    <td>{(movie.viewCount || 0).toLocaleString()}</td>
                    <td>{movie.avgRating ? Number(movie.avgRating).toFixed(1) : '0.0'}</td>
                    <td>
                      <div className={`admin-toggle ${movie.isVisible ? 'active' : ''}`} title={movie.isVisible ? 'Đang hiện' : 'Đang ẩn'} />
                    </td>
                    <td>
                      <div className={`admin-toggle ${movie.isFeatured ? 'active' : ''}`} title={movie.isFeatured ? 'Nổi bật' : 'Bình thường'} />
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button className="admin-action-btn btn-view" title="Xem" onClick={() => window.open(`/phim/${movie.slug}`, '_blank')}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button className="admin-action-btn btn-edit" title="Sửa" onClick={() => openEdit(movie)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="admin-action-btn btn-delete" title="Xóa" onClick={() => setDeleteTarget(movie)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{ padding: '16px 24px' }}>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Movie Form Modal */}
      {modalOpen && (
        <MovieFormModal
          movie={editingMovie}
          onClose={() => { setModalOpen(false); setEditingMovie(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa phim"
        message={`Bạn có chắc muốn xóa phim "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
