import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SearchInput } from '../common/SearchInput';
import { Button } from '../common/Button';
import { HistoryIcon, BookmarkIcon, LoginIcon, HomeIcon, GridIcon, FilmIcon, StarIcon, FlameIcon } from '../common/Icons';
import './layout.css';

export const Header = () => {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <header className="header-wrapper">
      {/* Top Bar */}
      <div className="header-top">
        <div className="container header-top-inner">
          <div className="logo-section">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h1 className="logo-text">Phim Hay <span className="text-gradient">24h</span></h1>
            </Link>
          </div>

          <div className="search-section">
            <SearchInput
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSubmit={handleSearch}
            />
          </div>

          <div className="action-section">
            <Button variant="dark" icon={<HistoryIcon size={18} />}>Lịch sử</Button>
            <Button variant="dark" icon={<BookmarkIcon size={18} />}>Theo dõi</Button>
            <Button variant="dark" icon={<LoginIcon size={18} />}>Đăng nhập</Button>
          </div>
        </div>
      </div>

      {/* Notice Bar */}
      <div className="notice-bar">
        <div className="container">
          Hãy đăng nhập để xem lịch sử và phim yêu thích nhé
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="main-nav">
        <div className="container">
          <ul className="nav-list">
            <li className="nav-item active">
              <Link to="/"><HomeIcon size={18} /> Trang chủ</Link>
            </li>
            <li className="nav-item">
              <a href="#"><GridIcon size={18} /> Thể Loại <span className="arrow-down">▾</span></a>
            </li>
            <li className="nav-item">
              <a href="#"><FilmIcon size={18} /> Phim Lẻ</a>
            </li>
            <li className="nav-item">
              <a href="#"><FlameIcon size={18} /> Đang Chiếu</a>
            </li>
            <li className="nav-item">
              <a href="#"><HistoryIcon size={18} /> Lịch Chiếu</a>
            </li>
            <li className="nav-item">
              <a href="#"><BookmarkIcon size={18} /> Hoàn Thành</a>
            </li>
            <li className="nav-item">
              <a href="#"><StarIcon size={18} /> Top 10 HH3D</a>
            </li>
            <li className="nav-item">
              <a href="#"><StarIcon size={18} /> Đánh Giá Cao</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
