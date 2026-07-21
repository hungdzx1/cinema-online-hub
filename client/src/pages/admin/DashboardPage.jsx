import { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { adminApi } from '../../services/adminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import '../../components/admin/admin.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const STAT_CARDS = [
  { key: 'totalMovies', label: 'Tổng số phim', icon: '🎬', variant: 'stat-total' },
  { key: 'totalPhimLe', label: 'Phim lẻ', icon: '🎞️', variant: 'stat-single' },
  { key: 'totalPhimBo', label: 'Phim bộ', icon: '📺', variant: 'stat-series' },
  { key: 'totalOngoing', label: 'Đang chiếu', icon: '▶️', variant: 'stat-ongoing' },
  { key: 'totalCompleted', label: 'Hoàn thành', icon: '✅', variant: 'stat-completed' },
  { key: 'totalViews', label: 'Tổng lượt xem', icon: '👁️', variant: 'stat-views' },
  { key: 'totalUsers', label: 'Tổng tài khoản', icon: '👥', variant: 'stat-users' },
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
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, genreData, topMoviesData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getGenreStats(),
          adminApi.getTopMovies(),
        ]);
        setStats(statsData);
        setGenreStats(genreData || []);
        setTopMovies(topMoviesData || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setStats({
          totalMovies: 0, totalPhimLe: 0, totalPhimBo: 0,
          totalOngoing: 0, totalCompleted: 0, totalViews: 0, totalUsers: 0,
        });
        setGenreStats([]);
        setTopMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Đang tải dữ liệu Dashboard..." />;
  }

  // 1. Chart Data: Genre Distribution (Horizontal Bar)
  const genreChartData = {
    labels: genreStats.map((g) => g.name),
    datasets: [{
      label: 'Số lượng phim',
      data: genreStats.map((g) => g.count),
      backgroundColor: genreStats.map((_, i) => CHART_COLORS[i % CHART_COLORS.length] + 'cc'),
      borderColor: genreStats.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
      borderWidth: 1.5,
      borderRadius: 6,
    }],
  };

  // 2. Chart Data: Top Movies by Views (Vertical Bar)
  const topMoviesChartData = {
    labels: topMovies.map((m) => (m.title.length > 18 ? m.title.substring(0, 16) + '...' : m.title)),
    datasets: [{
      label: 'Lượt xem',
      data: topMovies.map((m) => m.viewCount || 0),
      backgroundColor: 'rgba(255, 71, 87, 0.75)',
      borderColor: '#ff4757',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  // 3. Chart Data: Movie Types (Doughnut)
  const typeDoughnutData = {
    labels: ['Phim Lẻ', 'Phim Bộ'],
    datasets: [{
      data: [stats?.totalPhimLe || 0, stats?.totalPhimBo || 0],
      backgroundColor: ['#22c55e', '#3b82f6'],
      borderColor: isDark ? '#1a1a2e' : '#ffffff',
      borderWidth: 3,
    }],
  };

  // 4. Chart Data: Status Distribution (Doughnut)
  const statusDoughnutData = {
    labels: ['Đang Chiếu', 'Hoàn Thành'],
    datasets: [{
      data: [stats?.totalOngoing || 0, stats?.totalCompleted || 0],
      backgroundColor: ['#f59e0b', '#10b981'],
      borderColor: isDark ? '#1a1a2e' : '#ffffff',
      borderWidth: 3,
    }],
  };

  // Tooltip & Axis Styles
  const tooltipStyle = {
    backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
    titleColor: isDark ? '#ffffff' : '#1a1a2e',
    bodyColor: isDark ? '#cccccc' : '#555555',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    cornerRadius: 8,
    padding: 12,
  };

  const horizontalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: tooltipStyle,
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' },
        ticks: { color: isDark ? '#888' : '#666' },
      },
      y: {
        grid: { display: false },
        ticks: { color: isDark ? '#ccc' : '#444', font: { weight: 600 } },
      },
    },
  };

  const verticalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: tooltipStyle,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#ccc' : '#444', font: { size: 11 } },
      },
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' },
        ticks: { color: isDark ? '#888' : '#666' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#cccccc' : '#444444',
          font: { weight: 600, size: 12 },
          padding: 16,
        },
      },
      tooltip: tooltipStyle,
    },
    cutout: '68%',
  };

  return (
    <div className="dashboard-page">
      {/* Stats Grid */}
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

      {/* Charts Grid */}
      <div className="admin-charts-grid">
        {/* Chart 1: Top 10 Most Viewed Movies */}
        <div className="admin-chart-card">
          <h3>🔥 Top 10 Phim được xem nhiều nhất</h3>
          <div className="admin-chart-container" style={{ height: 280 }}>
            {topMovies.length > 0 ? (
              <Bar data={topMoviesChartData} options={verticalBarOptions} />
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>Chưa có dữ liệu lượt xem</div>
            )}
          </div>
        </div>

        {/* Chart 2: Movies per Genre */}
        <div className="admin-chart-card">
          <h3>📊 Số lượng phim theo thể loại</h3>
          <div className="admin-chart-container" style={{ height: 280 }}>
            {genreStats.length > 0 ? (
              <Bar data={genreChartData} options={horizontalBarOptions} />
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>Chưa có dữ liệu thể loại</div>
            )}
          </div>
        </div>

        {/* Chart 3: Movie Type Doughnut */}
        <div className="admin-chart-card">
          <h3>🎞️ Tỉ lệ Phim Lẻ vs Phim Bộ</h3>
          <div className="admin-chart-container" style={{ height: 240 }}>
            <Doughnut data={typeDoughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Chart 4: Status Doughnut */}
        <div className="admin-chart-card">
          <h3>🎬 Trạng thái phim (Đang chiếu / Hoàn thành)</h3>
          <div className="admin-chart-container" style={{ height: 240 }}>
            <Doughnut data={statusDoughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
