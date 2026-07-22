import { useState, useEffect } from 'react';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { adminApi } from '../../services/adminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import '../../components/admin/admin.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const STAT_CARDS = [
  { key: 'totalMovies',    label: 'Tổng số phim',        icon: '🎬', variant: 'stat-total' },
  { key: 'totalPhimLe',    label: 'Phim lẻ',             icon: '🎞️', variant: 'stat-single' },
  { key: 'totalPhimBo',    label: 'Phim bộ',             icon: '📺', variant: 'stat-series' },
  { key: 'totalOngoing',   label: 'Đang chiếu',          icon: '▶️',  variant: 'stat-ongoing' },
  { key: 'totalCompleted', label: 'Hoàn thành',          icon: '✅', variant: 'stat-completed' },
  { key: 'totalViews',     label: 'Tổng lượt xem',       icon: '👁️', variant: 'stat-views' },
  { key: 'totalUsers',     label: 'Tổng tài khoản',      icon: '👥', variant: 'stat-users' },
  { key: 'totalComments',  label: 'Bình luận',           icon: '💬', variant: 'stat-single' },
];

const CHART_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#06b6d4',
  '#a855f7', '#10b981', '#e11d48', '#84cc16', '#0ea5e9',
];

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [genreStats, setGenreStats] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, genreData, topMoviesData, recentUsersData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getGenreStats(),
          adminApi.getTopMovies(),
          adminApi.getRecentUsers(),
        ]);
        setStats(statsData);
        setGenreStats(genreData);
        setTopMovies(topMoviesData || []);
        setRecentUsers(recentUsersData || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setStats({
          totalMovies: 0, totalPhimLe: 0, totalPhimBo: 0,
          totalOngoing: 0, totalCompleted: 0, totalViews: 0, totalUsers: 0, totalComments: 0
        });
        setGenreStats([]);
        setTopMovies([]);
        setRecentUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Đang tải dữ liệu Dashboard..." />;
  }

  // 1. Chart: Phim theo thể loại (Bar chart ngang)
  const genreChartData = {
    labels: genreStats.map((g) => g.name),
    datasets: [{
      label: 'Số lượng phim',
      data: genreStats.map((g) => g.count),
      backgroundColor: genreStats.map((_, i) => CHART_COLORS[i % CHART_COLORS.length] + 'cc'),
      borderColor: genreStats.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  // 2. Chart: Top 10 Phim xem nhiều nhất (Bar chart đứng)
  const topMoviesChartData = {
    labels: topMovies.map((m) => m.title.length > 18 ? m.title.slice(0, 18) + '...' : m.title),
    datasets: [{
      label: 'Lượt xem',
      data: topMovies.map((m) => m.viewCount || 0),
      backgroundColor: '#ec4899cc',
      borderColor: '#ec4899',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  // 3. Chart: Phân bổ Phim Lẻ vs Phim Bộ (Doughnut)
  const typeChartData = {
    labels: ['Phim Lẻ', 'Phim Bộ'],
    datasets: [{
      data: [stats?.totalPhimLe || 0, stats?.totalPhimBo || 0],
      backgroundColor: ['#8b5cf6cc', '#ec4899cc'],
      borderColor: ['#8b5cf6', '#ec4899'],
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  // 4. Chart: Trạng thái phim (Pie)
  const statusChartData = {
    labels: ['Đang chiếu', 'Hoàn thành'],
    datasets: [{
      data: [stats?.totalOngoing || 0, stats?.totalCompleted || 0],
      backgroundColor: ['#f59e0bcc', '#10b981cc'],
      borderColor: ['#f59e0b', '#10b981'],
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? '#ddd' : '#333',
          font: { weight: 600 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#2a2a2a' : '#fff',
        titleColor: isDark ? '#fff' : '#1a1a2e',
        bodyColor: isDark ? '#aaa' : '#555',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
  };

  return (
    <div className="dashboard-page">
      {/* Stats Cards */}
      <div className="admin-stats-grid">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className={`admin-stat-card ${card.variant}`}>
            <div className="admin-stat-header">
              <span className="admin-stat-label">{card.label}</span>
              <div className="admin-stat-icon">{card.icon}</div>
            </div>
            <div className="admin-stat-value">
              {(stats?.[card.key] ?? 0).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Grid Biểu đồ Tròn: Định dạng Phim & Trạng thái */}
      <div className="admin-charts-grid">
        <div className="admin-chart-section">
          <h2 className="admin-chart-title">🍩 Tỷ lệ Định dạng Phim</h2>
          <div className="admin-chart-container" style={{ height: 260 }}>
            <Doughnut
              data={typeChartData}
              options={{
                ...commonOptions,
                plugins: {
                  ...commonOptions.plugins,
                  legend: { position: 'bottom', labels: { color: isDark ? '#ccc' : '#333' } },
                },
              }}
            />
          </div>
        </div>

        <div className="admin-chart-section">
          <h2 className="admin-chart-title">🍕 Trạng thái Trình chiếu</h2>
          <div className="admin-chart-container" style={{ height: 260 }}>
            <Pie
              data={statusChartData}
              options={{
                ...commonOptions,
                plugins: {
                  ...commonOptions.plugins,
                  legend: { position: 'bottom', labels: { color: isDark ? '#ccc' : '#333' } },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Biểu đồ Top 10 Phim Xem Nhiều Nhất */}
      {topMovies.length > 0 && (
        <div className="admin-chart-section">
          <h2 className="admin-chart-title">🔥 Top 10 Phim Xem Nhiều Nhất</h2>
          <div className="admin-chart-container" style={{ height: 320 }}>
            <Bar
              data={topMoviesChartData}
              options={{
                ...commonOptions,
                plugins: { ...commonOptions.plugins, legend: { display: false } },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: isDark ? '#aaa' : '#555', font: { size: 11 } },
                  },
                  y: {
                    grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' },
                    ticks: { color: isDark ? '#777' : '#8e8ea0' },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Biểu đồ Phim Theo Thể Loại */}
      {genreStats.length > 0 && (
        <div className="admin-chart-section">
          <h2 className="admin-chart-title">📊 Thống kê Phim theo Thể loại</h2>
          <div className="admin-chart-container" style={{ height: Math.max(260, genreStats.length * 36) }}>
            <Bar
              data={genreChartData}
              options={{
                ...commonOptions,
                indexAxis: 'y',
                plugins: { ...commonOptions.plugins, legend: { display: false } },
                scales: {
                  x: {
                    grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' },
                    ticks: { color: isDark ? '#777' : '#8e8ea0' },
                  },
                  y: {
                    grid: { display: false },
                    ticks: { color: isDark ? '#aaa' : '#555', font: { weight: 600 } },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Bảng Người dùng mới nhất */}
      {recentUsers.length > 0 && (
        <div className="admin-table-wrapper" style={{ marginTop: 32 }}>
          <div className="admin-table-toolbar">
            <h2 className="admin-chart-title" style={{ margin: 0 }}>👤 Tài khoản mới đăng ký gần đây</h2>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên tài khoản</th>
                <th>Email</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

