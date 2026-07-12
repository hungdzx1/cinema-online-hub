
import './layout.css';

export const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="container footer-inner">
        <div className="footer-col">
          <h2 className="logo-text">Phim Hay <span className="text-gradient">24h</span></h2>
          <p className="footer-desc">
            Website xem phim chất lượng cao. Cập nhật liên tục các bộ phim mới nhất.
          </p>
        </div>
        <div className="footer-col">
          <h3>Thể loại</h3>
          <ul>
            <li><a href="#">Phim Lẻ</a></li>
            <li><a href="#">Phim Bộ</a></li>
            <li><a href="#">Hoạt Hình</a></li>
            <li><a href="#">Đang Chiếu</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Hỗ trợ</h3>
          <ul>
            <li><a href="#">Liên hệ</a></li>
            <li><a href="#">Bản quyền</a></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Phim Hay 24h. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
