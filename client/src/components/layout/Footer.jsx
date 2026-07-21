import { useState } from 'react';
import { Link } from 'react-router-dom';
import './layout.css';

export const Footer = () => {
  const [modalType, setModalType] = useState(null);

  const closeModal = () => setModalType(null);

  return (
    <footer className="footer-wrapper">
      <div className="container footer-inner">
        {/* Cột 1: Thông tin thương hiệu & Liên hệ */}
        <div className="footer-col">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h2 className="logo-text">Phim Hay <span className="text-gradient">24h</span></h2>
          </Link>
          <p className="footer-desc">
            Website xem phim chất lượng cao. Cập nhật liên tục các bộ phim mới nhất, phim chiếu rạp, phim bộ và phim hoạt hình hấp dẫn.
          </p>

          <div className="footer-contact-box">
            <span className="footer-contact-label">✉ Liên hệ & Quảng cáo:</span>
            <a href="mailto:admin@phimplay24.com" className="footer-email-link">
              admin@phimplay24.com
            </a>
          </div>
        </div>

        {/* Cột 2: Danh mục phim */}
        <div className="footer-col">
          <h3>Thể loại</h3>
          <ul>
            <li><Link to="/search?type=phim_le">Phim Lẻ</Link></li>
            <li><Link to="/search?type=phim_bo">Phim Bộ</Link></li>
            <li><Link to="/search?type=hoat_hinh">Hoạt Hình</Link></li>
            <li><Link to="/search?status=ongoing">Phim Đang Chiếu</Link></li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ & Điều khoản */}
        <div className="footer-col">
          <h3>Hỗ trợ</h3>
          <ul>
            <li><button type="button" onClick={() => setModalType('contact')}>Liên hệ</button></li>
            <li><button type="button" onClick={() => setModalType('dmca')}>Bản quyền</button></li>
            <li><button type="button" onClick={() => setModalType('terms')}>Điều khoản sử dụng</button></li>
            <li><button type="button" onClick={() => setModalType('privacy')}>Chính sách bảo mật</button></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>
            &copy; {new Date().getFullYear()} Phim Hay 24h. Tất cả quyền được bảo lưu. Email liên hệ:{' '}
            <a href="mailto:admin@phimplay24.com" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              admin@phimplay24.com
            </a>
          </p>
        </div>
      </div>

      {/* Info Modals */}
      {modalType && (
        <div className="footer-modal-overlay" onClick={closeModal}>
          <div className="footer-modal-card fade-in" onClick={(e) => e.stopPropagation()}>
            <button className="footer-modal-close" onClick={closeModal} aria-label="Đóng">
              ✕
            </button>

            {modalType === 'contact' && (
              <div>
                <h3 className="footer-modal-title">📬 Thông tin Liên hệ & Hỗ trợ</h3>
                <div className="footer-modal-body">
                  <p>Mọi thắc mắc, đóng góp ý kiến, báo lỗi phim hoặc nhu cầu hợp tác quảng cáo xin vui lòng liên hệ Ban quản trị website Phim Hay 24h:</p>
                  <div className="footer-modal-info-card">
                    <p><strong>📧 Email chính thức:</strong> <a href="mailto:admin@phimplay24.com">admin@phimplay24.com</a></p>
                    <p><strong>⏰ Thời gian làm việc:</strong> 24/7 (Phản hồi trong vòng 1-12h)</p>
                    <p><strong>💬 Hỗ trợ nhanh:</strong> Phản hồi sự cố phát video, khôi phục tài khoản và tiếp nhận yêu cầu phim mới.</p>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <a href="mailto:admin@phimplay24.com" className="footer-modal-btn">
                      ✉ Gửi Email ngay
                    </a>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'dmca' && (
              <div>
                <h3 className="footer-modal-title">⚖️ Quy định Bản quyền & DMCA</h3>
                <div className="footer-modal-body">
                  <p>Phim Hay 24h tôn trọng quyền sở hữu trí tuệ của các tác giả và các bên giữ bản quyền.</p>
                  <ul>
                    <li>Website không lưu trữ trực tiếp bất kỳ tệp video phim nào trên máy chủ. Tất cả video đều được nhúng từ các trang chia sẻ miễn phí công khai trên Internet.</li>
                    <li>Chúng tôi không chịu trách nhiệm pháp lý về tính chính xác hay bản quyền của các tệp do bên thứ ba lưu trữ.</li>
                    <li>Nếu bạn là chủ sở hữu bản quyền hợp pháp và yêu cầu gỡ bỏ nội dung, xin vui lòng gửi email về: <strong>admin@phimplay24.com</strong> kèm bằng chứng sở hữu. Nội dung vi phạm sẽ được gỡ bỏ khỏi website trong 24-48h.</li>
                  </ul>
                </div>
              </div>
            )}

            {modalType === 'terms' && (
              <div>
                <h3 className="footer-modal-title">📜 Điều khoản sử dụng dịch vụ</h3>
                <div className="footer-modal-body">
                  <p>Khi sử dụng dịch vụ tại Phim Hay 24h, người dùng đồng ý tuân thủ các quy định sau:</p>
                  <ul>
                    <li>Dịch vụ xem phim hoàn toàn miễn phí cho người dùng cuối.</li>
                    <li>Người dùng không đăng tải các bình luận xúc phạm, vi phạm pháp luật hoặc quảng cáo rác (spam).</li>
                    <li>Không sử dụng công cụ tự động (bot, script) gây quá tải hạ tầng hệ thống.</li>
                  </ul>
                </div>
              </div>
            )}

            {modalType === 'privacy' && (
              <div>
                <h3 className="footer-modal-title">🔒 Chính sách bảo mật thông tin</h3>
                <div className="footer-modal-body">
                  <p>Chúng tôi cam kết bảo vệ dữ liệu cá nhân của người dùng tuyệt đối:</p>
                  <ul>
                    <li>Mật khẩu tài khoản được mã hóa một chiều an toàn (Bcrypt).</li>
                    <li>Lịch sử xem và danh sách phim theo dõi chỉ sử dụng để cá nhân hóa trải nghiệm xem phim của bạn.</li>
                    <li>Chúng tôi không cung cấp hay chia sẻ dữ liệu người dùng cho bất kỳ bên thứ ba nào.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
