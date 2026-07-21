import { useState } from 'react';
import { Link } from 'react-router-dom';
import './layout.css';

export const Footer = () => {
  const [activeModal, setActiveModal] = useState(null); // 'contact' | 'copyright' | 'terms' | 'privacy'
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleOpenModal = (e, modalType) => {
    e.preventDefault();
    setActiveModal(modalType);
    setSentSuccess(false);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSentSuccess(false);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <footer className="footer-wrapper">
      <div className="container footer-inner">
        <div className="footer-col">
          <h2 className="logo-text">Phim Hay <span className="text-gradient">24h</span></h2>
          <p className="footer-desc">
            Website xem phim chất lượng cao. Cập nhật liên tục các bộ phim mới nhất.
          </p>
          <div className="footer-contact-info">
            📧 Liên hệ Admin: <a href="mailto:admin@phimplay24.com">admin@phimplay24.com</a>
          </div>
        </div>

        <div className="footer-col">
          <h3>Thể loại</h3>
          <ul>
            <li><Link to="/search?type=phim_le">Phim Lẻ</Link></li>
            <li><Link to="/search?type=phim_bo">Phim Bộ</Link></li>
            <li><Link to="/search?type=hoat_hinh">Hoạt Hình</Link></li>
            <li><Link to="/search?status=ongoing">Đang Chiếu</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Hỗ trợ</h3>
          <ul>
            <li><a href="#contact" onClick={(e) => handleOpenModal(e, 'contact')}>Liên hệ</a></li>
            <li><a href="#copyright" onClick={(e) => handleOpenModal(e, 'copyright')}>Bản quyền</a></li>
            <li><a href="#terms" onClick={(e) => handleOpenModal(e, 'terms')}>Điều khoản sử dụng</a></li>
            <li><a href="#privacy" onClick={(e) => handleOpenModal(e, 'privacy')}>Chính sách bảo mật</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Phim Hay 24h. All rights reserved.</p>
        </div>
      </div>

      {/* Modal Popup */}
      {activeModal && (
        <div className="footer-modal-overlay" onClick={handleCloseModal}>
          <div className="footer-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="footer-modal-close" onClick={handleCloseModal} aria-label="Đóng">✕</button>

            {activeModal === 'contact' && (
              <div className="footer-modal-content">
                <h2>📬 Liên hệ Ban Quản Trị</h2>
                <p>Nếu bạn có góp ý, thắc mắc hoặc cần hỗ trợ về phim, vui lòng gửi tin nhắn cho chúng tôi hoặc liên hệ trực tiếp qua Email:</p>
                <div className="contact-email-box">
                  ✉️ <strong>admin@phimplay24.com</strong>
                </div>

                {sentSuccess ? (
                  <div className="sent-success-message">
                    🎉 Cảm ơn bạn đã gửi phản hồi! Ban quản trị đã tiếp nhận và sẽ phản hồi tới bạn qua email sớm nhất.
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="footer-contact-form">
                    <input
                      type="text"
                      placeholder="Họ và tên của bạn..."
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                    <input
                      type="email"
                      placeholder="Email liên hệ của bạn..."
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                    <textarea
                      placeholder="Nội dung cần gửi / Báo lỗi phim..."
                      rows={4}
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                    <button type="submit" className="footer-submit-btn">Gửi tin nhắn</button>
                  </form>
                )}
              </div>
            )}

            {activeModal === 'copyright' && (
              <div className="footer-modal-content">
                <h2>📜 Chính sách Bản quyền (DMCA)</h2>
                <p>Tất cả nội dung hình ảnh và video trên website Phim Hay 24h được tổng hợp từ các nguồn chia sẻ công khai trên Internet.</p>
                <p>Chúng tôi luôn tôn trọng quyền sở hữu trí tuệ của các nhà sáng tạo. Nếu bạn là chủ sở hữu bản quyền của bất kỳ nội dung nào và không muốn hiển thị trên trang web, vui lòng gửi yêu cầu gỡ bỏ tới Email:</p>
                <div className="contact-email-box">
                  ✉️ <strong>admin@phimplay24.com</strong>
                </div>
                <p>Ban quản trị sẽ tiến hành kiểm tra và gỡ bỏ nội dung theo yêu cầu trong vòng 24 - 48 giờ làm việc.</p>
              </div>
            )}

            {activeModal === 'terms' && (
              <div className="footer-modal-content">
                <h2>📋 Điều khoản Sử dụng</h2>
                <ol className="terms-list">
                  <li><strong>Tài khoản người dùng:</strong> Thành viên chịu trách nhiệm bảo mật thông tin tài khoản cá nhân của mình.</li>
                  <li><strong>Quy tắc bình luận:</strong> Không đăng tải văn hóa phẩm đồi trụy, nội dung kích động, xúc phạm hoặc vi phạm pháp luật.</li>
                  <li><strong>Phạm vi sử dụng:</strong> Trang web phục vụ cho nhu cầu theo dõi và giải trí cá nhân hoàn toàn phi thương mại.</li>
                </ol>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div className="footer-modal-content">
                <h2>🔒 Chính sách Bảo mật</h2>
                <p>Phim Hay 24h cam kết bảo vệ thông tin riêng tư của người dùng:</p>
                <ul>
                  <li>Thông tin cá nhân (Email, Tên người dùng) chỉ dùng để cung cấp trải nghiệm theo dõi phim và lịch sử xem phim.</li>
                  <li>Không bao giờ chia sẻ hay thương mại hóa thông tin thành viên cho bất kỳ bên thứ ba nào.</li>
                  <li>Mọi thông tin mật khẩu đều được mã hóa bảo mật chuẩn trên hệ thống.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
