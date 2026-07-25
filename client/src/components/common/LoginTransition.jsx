import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login-transition.css';

/**
 * LoginTransition
 * -----------------------------------------------------------
 * BỔ SUNG: prop `onDone` (tùy chọn).
 * - Nếu có `onDone` → gọi `onDone()` khi hiệu ứng kết thúc,
 *   KHÔNG tự navigate nữa (để component cha quyết định bước tiếp
 *   theo, ví dụ chuyển sang Cinema3DIntro).
 * - Nếu không truyền `onDone` → giữ hành vi cũ, tự
 *   navigate(destination) như trước (không phá code cũ đang dùng).
 */
export const LoginTransition = ({ destination, username, onDone }) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const handleFinish = () => {
      if (onDone) {
        onDone();
      } else {
        navigate(destination);
      }
    };

    const timers = [
      setTimeout(() => setPhase(1), 100),    // Card xoay + zoom sâu
      setTimeout(() => setPhase(2), 800),    // Star field bay tới
      setTimeout(() => setPhase(3), 2200),   // Logo 3D xuất hiện
      setTimeout(() => setPhase(4), 3200),   // Fade out
      setTimeout(handleFinish, 3800),        // Kết thúc: chuyển trang hoặc báo callback
    ];
    return () => timers.forEach(clearTimeout);
  }, [destination, navigate, onDone]);

  return (
    <div className={`lt-overlay phase-${phase}`}>
      {/* Canvas particles/star field */}
      <canvas className="lt-canvas" ref={(canvas) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const stars = Array.from({ length: 200 }, () => ({
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 2000,
          z: Math.random() * 1500 + 500,
        }));

        let raf;
        let startTime = Date.now();
        const duration = 2800;

        const draw = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          ctx.fillStyle = 'rgba(0,0,0,1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const cx = canvas.width / 2;
          const cy = canvas.height / 2;

          stars.forEach((star) => {
            star.z -= progress * 25;
            if (star.z <= 1) {
              star.z = 1500;
              star.x = (Math.random() - 0.5) * 2000;
              star.y = (Math.random() - 0.5) * 2000;
            }

            const sx = (star.x / star.z) * 400 + cx;
            const sy = (star.y / star.z) * 400 + cy;
            const size = Math.max(0.5, (1 - star.z / 1500) * 3);
            const brightness = Math.min(1, (1 - star.z / 1500) * 1.5);

            // Vệt sáng elongated khi bay nhanh
            if (progress > 0.2) {
              const prevZ = star.z + progress * 20;
              const psx = (star.x / prevZ) * 400 + cx;
              const psy = (star.y / prevZ) * 400 + cy;

              const grad = ctx.createLinearGradient(psx, psy, sx, sy);
              const alpha = brightness * 0.6;
              grad.addColorStop(0, `rgba(255,165,2,0)`);
              grad.addColorStop(1, `rgba(255,165,2,${alpha})`);
              ctx.strokeStyle = grad;
              ctx.lineWidth = size * 0.8;
              ctx.beginPath();
              ctx.moveTo(psx, psy);
              ctx.lineTo(sx, sy);
              ctx.stroke();
            }

            // Điểm sao
            const r = Math.round(255 * brightness);
            const g = Math.round(165 * brightness);
            const b = Math.round(50 + 200 * brightness);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
          });

          if (elapsed < duration) {
            raf = requestAnimationFrame(draw);
          }
        };

        draw();
        return () => cancelAnimationFrame(raf);
      }} />

      {/* Logo 3D */}
      <div className="lt-logo-container">
        <div className="lt-logo-3d">
          <span className="lt-logo-text">Phim Hay</span>
          <span className="lt-logo-accent">24h</span>
        </div>
        <div className="lt-welcome">
          {username ? `Chào mừng, ${username}!` : 'Chào mừng trở lại!'}
        </div>
      </div>

      {/* Vòng tròn năng lượng mở rộng */}
      <div className="lt-ring lt-ring-1" />
      <div className="lt-ring lt-ring-2" />
      <div className="lt-ring lt-ring-3" />

      {/* Flash trắng nhanh */}
      <div className="lt-flash" />
    </div>
  );
};