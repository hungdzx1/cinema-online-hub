import { useState, useEffect, useMemo } from 'react';
import { userApi } from '../../services/userApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Pagination } from '../../components/common/Pagination';
import '../../components/admin/admin.css';

const ITEMS_PER_PAGE = 10;

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getInitials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Không thể tải danh sách tài khoản');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u) =>
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleToggleBan = async (user) => {
    try {
      await userApi.toggleBan(user.id);
      toast.success(user.isBanned ? `Đã mở khóa ${user.username}` : `Đã khóa ${user.username}`);
      fetchUsers();
    } catch {
      toast.error('Thay đổi trạng thái thất bại');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userApi.updateRole(userId, newRole);
      toast.success('Đã thay đổi quyền');
      fetchUsers();
    } catch {
      toast.error('Thay đổi quyền thất bại');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await userApi.delete(deleteTarget.id);
      toast.success(`Đã xóa tài khoản ${deleteTarget.username}`);
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error('Xóa tài khoản thất bại');
    }
  };

  const isSelf = (userId) => currentUser?.id === userId;

  if (loading) return <LoadingSpinner text="Đang tải danh sách tài khoản..." />;

  return (
    <div className="users-admin-page">
      <div className="admin-table-wrapper">
        {/* Toolbar */}
        <div className="admin-table-toolbar">
          <div className="admin-table-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm tài khoản..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="admin-table-actions">
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Tổng: {filteredUsers.length} tài khoản
            </span>
          </div>
        </div>

        {/* Table */}
        {paginatedUsers.length === 0 ? (
          <div className="admin-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <h3>Không có tài khoản nào</h3>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="admin-user-avatar" />
                      ) : (
                        <div className="admin-user-avatar-initials">{getInitials(user.username)}</div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{user.username}</span>
                      {isSelf(user.id) && <span style={{ fontSize: 11, color: 'var(--color-primary)', marginLeft: 6 }}>(Bạn)</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{user.email}</td>
                    <td>
                      {isSelf(user.id) ? (
                        <span className="admin-badge badge-admin">👑 Admin</span>
                      ) : (
                        <select
                          className="admin-role-select"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(user.createdAt)}</td>
                    <td>
                      <span className={`admin-badge ${user.isBanned ? 'badge-banned' : 'badge-active'}`}>
                        {user.isBanned ? '🔒 Đã khóa' : '✅ Hoạt động'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        {!isSelf(user.id) && (
                          <>
                            <button
                              className={`admin-action-btn ${user.isBanned ? 'btn-view' : 'btn-edit'}`}
                              title={user.isBanned ? 'Mở khóa' : 'Khóa'}
                              onClick={() => handleToggleBan(user)}
                            >
                              {user.isBanned ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                              )}
                            </button>
                            <button
                              className="admin-action-btn btn-delete"
                              title="Xóa"
                              onClick={() => setDeleteTarget(user)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </>
                        )}
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

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa tài khoản"
        message={`Bạn có chắc muốn xóa tài khoản "${deleteTarget?.username}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
