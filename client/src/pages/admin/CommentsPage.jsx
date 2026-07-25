import { useState, useEffect, useMemo } from 'react';
import { movieApi } from '../../services/movieApi';
import { commentApi } from '../../services/commentApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import '../../components/admin/admin.css';

export const CommentsPage = () => {
  useDocumentTitle('Quản Lý Bình Luận');
  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(''); // ✅ THÊM STATE TÌM KIẾM
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  // 1. Tải danh sách tất cả phim
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoadingMovies(true);
        const res = await movieApi.filterMovies({ limit: 100 }); 
        setMovies(res?.data || []);
      } catch (err) {
        toast.error('Không thể tải danh sách phim');
      } finally {
        setLoadingMovies(false);
      }
    };
    fetchMovies();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ Lọc danh sách phim theo từ khóa tìm kiếm
  const filteredMovies = useMemo(() => {
    if (!searchTerm.trim()) return movies;
    const q = searchTerm.toLowerCase();
    return movies.filter(m => m.title?.toLowerCase().includes(q));
  }, [movies, searchTerm]);

  // 2. Khi click vào 1 phim, tải bình luận của phim đó
  const handleSelectMovie = async (movie) => {
    setSelectedMovie(movie);
    try {
      setLoadingComments(true);
      const data = await commentApi.getByMovieId(movie.id);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Không thể tải bình luận cho phim này');
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // 3. Xử lý ẩn/hiện bình luận
  const handleToggleHide = async (comment) => {
    try {
      await commentApi.toggleHide(comment.id);
      toast.success(`Đã ${comment.isHidden ? 'hiện' : 'ẩn'} bình luận`);
      setComments(prev => prev.map(c => c.id === comment.id ? { ...c, isHidden: !c.isHidden } : c));
    } catch (err) {
      toast.error('Cập nhật thất bại');
    }
  };

  // 4. Xử lý xóa bình luận
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await commentApi.delete(deleteTarget.id);
      toast.success('Đã xóa bình luận');
      setComments(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Xóa bình luận thất bại');
    }
  };

  if (loadingMovies) return <LoadingSpinner text="Đang tải danh sách phim..." />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, height: 'calc(100vh - 160px)' }}>
      
      {/* ===== CỘT TRÁI: DANH SÁCH PHIM (CÓ Ô TÌM KIẾM) ===== */}
      <div className="admin-table-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Ô tìm kiếm phim */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="admin-table-search" style={{ width: '100%', minWidth: 'auto' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm tên phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Danh sách phim đã lọc */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filteredMovies.length === 0 ? (
            <div className="admin-empty" style={{ padding: '20px' }}>
              <p>Không tìm thấy phim phù hợp.</p>
            </div>
          ) : (
            filteredMovies.map(m => (
              <div 
                key={m.id} 
                onClick={() => handleSelectMovie(m)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: selectedMovie?.id === m.id ? 'rgba(255,71,87,0.1)' : 'transparent',
                  color: selectedMovie?.id === m.id ? 'var(--color-primary)' : 'var(--text-primary)',
                  fontWeight: selectedMovie?.id === m.id ? 600 : 400,
                  transition: 'background 0.2s',
                  fontSize: 14,
                }}
              >
                {m.title}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== CỘT PHẢI: DANH SÁCH BÌNH LUẬN ===== */}
      <div className="admin-table-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="admin-table-toolbar">
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 16 }}>
            {selectedMovie ? `Bình luận của: ${selectedMovie.title}` : 'Vui lòng chọn 1 bộ phim'}
          </h2>
        </div>

        {!selectedMovie ? (
          <div className="admin-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h3>Chưa chọn phim</h3>
            <p>Hãy click vào 1 bộ phim ở cột bên trái để xem bình luận.</p>
          </div>
        ) : loadingComments ? (
          <div style={{ padding: 40, textAlign: 'center' }}><LoadingSpinner text="Đang tải bình luận..." /></div>
        ) : comments.length === 0 ? (
          <div className="admin-empty">
            <h3>Phim này chưa có bình luận nào</h3>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 120 }}>Người gửi</th>
                  <th>Nội dung</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.user?.username || 'N/A'}</td>
                    <td style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.content}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <span className={`admin-badge ${c.isHidden ? 'badge-banned' : 'badge-active'}`}>
                        {c.isHidden ? '🔒 Đã ẩn' : '✅ Hiện'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button 
                          className={`admin-action-btn ${c.isHidden ? 'btn-view' : 'btn-edit'}`} 
                          title={c.isHidden ? 'Hiện bình luận' : 'Ẩn bình luận'}
                          onClick={() => handleToggleHide(c)}
                        >
                          {c.isHidden ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          )}
                        </button>
                        <button 
                          className="admin-action-btn btn-delete" 
                          title="Xóa vĩnh viễn"
                          onClick={() => setDeleteTarget(c)}
                        >
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
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa bình luận"
        message={`Bạn có chắc muốn xóa bình luận này? Hành động không thể hoàn tác.`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};