import { useState, useEffect } from 'react';
import { genreApi } from '../../services/genreApi';
import { countryApi } from '../../services/countryApi';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import '../../components/admin/admin.css';

export const CategoriesPage = () => {
  useDocumentTitle('Quản Lý Danh Mục');
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [genreForm, setGenreForm] = useState({ id: null, name: '' });
  const [editingGenre, setEditingGenre] = useState(null);
  const [deleteGenreTarget, setDeleteGenreTarget] = useState(null);

  const [countryForm, setCountryForm] = useState({ id: null, name: '' });
  const [editingCountry, setEditingCountry] = useState(null);
  const [deleteCountryTarget, setDeleteCountryTarget] = useState(null);

  const toast = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [genreData, countryData] = await Promise.all([genreApi.getAll(), countryApi.getAll()]);
      console.log("Genres data:", genreData); // ✅ Kiểm tra xem có dữ liệu trả về không
      console.log("Countries data:", countryData);
      setGenres(Array.isArray(genreData) ? genreData : []);
      setCountries(Array.isArray(countryData) ? countryData : []);
    } catch (err) {
      toast.error('Không thể tải danh mục');
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Handlers Genre ---
  const handleGenreSubmit = async () => {
    if (!genreForm.name.trim()) return toast.warning('Tên thể loại không được trống');
    try {
      const payload = { name: genreForm.name };
      
      if (editingGenre) {
        await genreApi.update(editingGenre.id, payload);
        toast.success('Đã cập nhật thể loại');
      } else {
        await genreApi.create(payload);
        toast.success('Đã thêm thể loại mới');
      }
      setGenreForm({ id: null, name: '' });
      setEditingGenre(null);
      fetchData(); // ✅ Gọi lại hàm tải dữ liệu
    } catch (err) {
      toast.error('Lưu thất bại. Có thể tên này đã tồn tại.');
      console.error("Genre submit error:", err);
    }
  };

  const handleGenreDelete = async () => {
    if (!deleteGenreTarget) return;
    try {
      await genreApi.delete(deleteGenreTarget.id);
      toast.success(`Đã xóa thể loại "${deleteGenreTarget.name}"`);
      setDeleteGenreTarget(null);
      fetchData(); // ✅ Gọi lại hàm tải dữ liệu
    } catch (err) {
      // Nếu Backend trả về lỗi 500 (do khóa ngoại), sẽ nhảy vào đây
      toast.error('Không thể xóa! Thể loại này đang được gán cho phim.');
      setDeleteGenreTarget(null);
      console.error("Genre delete error:", err);
    }
  };

  // --- Handlers Country ---
  const handleCountrySubmit = async () => {
    if (!countryForm.name.trim()) return toast.warning('Tên quốc gia không được trống');
    try {
      const payload = { name: countryForm.name };
      
      if (editingCountry) {
        await countryApi.update(editingCountry.id, payload);
        toast.success('Đã cập nhật quốc gia');
      } else {
        await countryApi.create(payload);
        toast.success('Đã thêm quốc gia mới');
      }
      setCountryForm({ id: null, name: '' });
      setEditingCountry(null);
      fetchData(); // ✅ Gọi lại hàm tải dữ liệu
    } catch (err) {
      toast.error('Lưu thất bại. Có thể tên này đã tồn tại.');
      console.error("Country submit error:", err);
    }
  };

  const handleCountryDelete = async () => {
    if (!deleteCountryTarget) return;
    try {
      await countryApi.delete(deleteCountryTarget.id);
      toast.success(`Đã xóa quốc gia "${deleteCountryTarget.name}"`);
      setDeleteCountryTarget(null);
      fetchData(); // ✅ Gọi lại hàm tải dữ liệu
    } catch (err) {
      toast.error('Không thể xóa! Quốc gia này đang được gán cho phim.');
      setDeleteCountryTarget(null);
      console.error("Country delete error:", err);
    }
  };

  if (loading) return <LoadingSpinner text="Đang tải danh mục..." />;

  return (
    <div className="categories-admin-page" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      
      {/* ===== CỘT THỂ LOẠI ===== */}
      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Thể loại phim</h2>
          
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input 
              className="admin-form-input" 
              placeholder="Tên thể loại (vd: Hành Động)" 
              value={genreForm.name}
              onChange={(e) => setGenreForm(prev => ({ ...prev, name: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleGenreSubmit()}
            />
            <button className="admin-add-btn" onClick={handleGenreSubmit} style={{ flexShrink: 0 }}>
              {editingGenre ? 'Lưu' : '+ Thêm'}
            </button>
            {editingGenre && (
              <button className="admin-btn-secondary" onClick={() => { setEditingGenre(null); setGenreForm({ id: null, name: '' }); }} style={{ flexShrink: 0 }}>
                Hủy
              </button>
            )}
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Slug</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {genres.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20 }}>Chưa có dữ liệu</td></tr>
            ) : (
              genres.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{g.slug}</td>
                  <td>
                    <div className="admin-action-btns">
                      <button className="admin-action-btn btn-edit" title="Sửa" onClick={() => { setEditingGenre(g); setGenreForm({ id: g.id, name: g.name }); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="admin-action-btn btn-delete" title="Xóa" onClick={() => setDeleteGenreTarget(g)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== CỘT QUỐC GIA ===== */}
      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Quốc gia</h2>
          
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input 
              className="admin-form-input" 
              placeholder="Tên quốc gia (vd: Hàn Quốc)" 
              value={countryForm.name}
              onChange={(e) => setCountryForm(prev => ({ ...prev, name: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleCountrySubmit()}
            />
            <button className="admin-add-btn" onClick={handleCountrySubmit} style={{ flexShrink: 0 }}>
              {editingCountry ? 'Lưu' : '+ Thêm'}
            </button>
            {editingCountry && (
              <button className="admin-btn-secondary" onClick={() => { setEditingCountry(null); setCountryForm({ id: null, name: '' }); }} style={{ flexShrink: 0 }}>
                Hủy
              </button>
            )}
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Slug</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {countries.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20 }}>Chưa có dữ liệu</td></tr>
            ) : (
              countries.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.slug}</td>
                  <td>
                    <div className="admin-action-btns">
                      <button className="admin-action-btn btn-edit" title="Sửa" onClick={() => { setEditingCountry(c); setCountryForm({ id: c.id, name: c.name }); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="admin-action-btn btn-delete" title="Xóa" onClick={() => setDeleteCountryTarget(c)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={!!deleteGenreTarget}
        title="Xóa thể loại"
        message={`Bạn có chắc muốn xóa thể loại "${deleteGenreTarget?.name}"?`}
        confirmText="Xóa"
        onConfirm={handleGenreDelete}
        onCancel={() => setDeleteGenreTarget(null)}
      />
      <ConfirmDialog
        open={!!deleteCountryTarget}
        title="Xóa quốc gia"
        message={`Bạn có chắc muốn xóa quốc gia "${deleteCountryTarget?.name}"?`}
        confirmText="Xóa"
        onConfirm={handleCountryDelete}
        onCancel={() => setDeleteCountryTarget(null)}
      />
    </div>
  );
};