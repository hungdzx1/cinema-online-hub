import './common.css';

export const LoadingSpinner = ({ size = 40, text = 'Đang tải...' }) => {
  return (
    <div className="loading-wrapper">
      <div className="loading-spinner" style={{ width: size, height: size }}>
        <svg viewBox="0 0 50 50" className="loading-svg">
          <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" className="loading-circle" />
        </svg>
      </div>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};

export const SkeletonLine = ({ width = '100%', height = 16 }) => (
  <div className="skeleton-line" style={{ width, height, borderRadius: 6 }} />
);

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <SkeletonLine height={20} width="60%" />
    <SkeletonLine height={36} width="40%" />
    <SkeletonLine height={14} width="80%" />
  </div>
);
