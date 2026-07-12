import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { adminApi } from '../../services/adminApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import '../../components/admin/admin.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const STAT_CARDS = [
  { key: 'totalMovies',    label: 'Tổng số phim',        icon: '🎬', variant: 'stat-total' },
  { key: 'totalPhimLe',    label: 'Phim lẻ',             icon: '🎞️', variant: 'stat-single' },
  { key: 'totalPhimBo',    label: 'Phim bộ',             icon: '📺', variant: 'stat-series' },
  { key: 'totalOngoing',   label: 'Đang chiếu',          icon: '▶️',  variant: 'stat-ongoing' },
  { key: 'totalCompleted', label: 'Hoàn thành',          icon: '✅', variant: 'stat-completed' },
  { key: 'totalViews',     label: 'Tổng lượt xem',       icon: '👁️', variant: 'stat-views' },
  { key: 'totalUsers',     label: 'Tổng tài khoản',      icon: '👥', variant: 'stat-users' },
];

const CHART_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#06b6d4',
  '#a855f7', '#10b981', '#e11d48', '#84cc16', '#0ea5e9',
];

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [genreStats, setGenreStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, genreData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getGenreStats(),
        ]);
        setStats(statsData);
        setGenreStats(genreData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        // Use mock data as fallback
        setStats({
          totalMovies: 0, totalPhimLe: 0, totalPhimBo: 0,
          totalOngoing: 0, totalCompleted: 0, totalViews: 0, totalUsers: 0,
        });
        setGenreStats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Đang tải dữ liệu Dashboard..." />;
  }

  const chartData = {
    labels: genreStats.map((g) => g.name),
    datasets: [{
      label: 'Số lượng phim',
      data: genreStats.map((g) => g.count),
      backgroundColor: genreStats.map((_, i) => CHART_COLORS[i % CHART_COLORS.length] + '99'),
      borderColor: genreStats.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
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

      {/* Genre Chart */}
      {genreStats.length > 0 && (
        <div className="admin-chart-section">
          <h2 className="admin-chart-title">📊 Số lượng phim theo thể loại</h2>
          <div className="admin-chart-container" style={{ height: Math.max(250, genreStats.length * 38) }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};
