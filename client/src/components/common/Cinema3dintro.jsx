import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import './cinema-3d-intro.css';

/**
 * Cinema3DIntro
 * ----------------------------------------------------------------
 * Cảnh 3D điện ảnh chạy tự động ~10s sau khi đăng nhập thành công,
 * trước khi chuyển vào trang chính. Không cần thao tác chuột —
 * camera tự bay qua cảnh (giống trailer mở đầu). Người dùng vẫn có
 * thể bấm "Bỏ qua" để vào ngay (khuyến nghị UX, có thể xoá nếu
 * bạn muốn ép xem hết).
 *
 * Dùng Three.js thuần (không React Three Fiber) để đồng bộ phong
 * cách với LoginTransition.jsx bạn đang có (canvas ref + render loop
 * thủ công), tránh phải học thêm 1 hệ sinh thái mới.
 *
 * Cảnh gồm:
 *  - Dải phim (film strip) dạng vòng cung cuộn quanh camera
 *  - Các "cuộn phim" (torus) trôi nổi, xoay chậm
 *  - Trường hạt sáng (star field) làm nền sâu
 *  - Vệt sáng sân khấu (spotlight cone) quét chéo
 *  - Logo 3D "PHIMPLAY24" nổi lên ở đoạn cuối
 *  - Camera bay dọc một đường cong Catmull-Rom trong suốt thời lượng
 *
 * Props:
 *  - duration:   tổng thời gian cảnh (ms), mặc định 10000
 *  - destination: route điều hướng tới khi cảnh kết thúc
 *  - username:   tên hiển thị trong dòng chào mừng
 *  - allowSkip:  có hiện nút "Bỏ qua" hay không (mặc định true)
 */
export const Cinema3DIntro = ({
  duration = 10000,
  destination = '/',
  username,
  allowSkip = true,
}) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFadingOut(true);
    setTimeout(() => navigate(destination), 700);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // ===== Renderer / Scene / Camera =====
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.012);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);

    // ===== Ánh sáng =====
    scene.add(new THREE.AmbientLight(0x332211, 0.6));
    const keyLight = new THREE.PointLight(0xffa502, 2.5, 400);
    keyLight.position.set(0, 20, 0);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xff4757, 1.8, 500);
    rimLight.position.set(-100, 10, -100);
    scene.add(rimLight);

    // ===== 1. Trường hạt sáng (star field nền sâu) =====
    const STAR_COUNT = 1400;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const radius = 200 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = radius * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffe8c2,
      size: 1.6,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // ===== 2. Các cuộn phim trôi nổi (torus xoay chậm) =====
    const reelGroup = new THREE.Group();
    const reelMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.7,
      roughness: 0.35,
      emissive: 0xff4757,
      emissiveIntensity: 0.15,
    });
    const REEL_COUNT = 9;
    const reels = [];
    for (let i = 0; i < REEL_COUNT; i++) {
      const size = 4 + Math.random() * 6;
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(size, size * 0.28, 16, 48),
        reelMat
      );
      const angle = (i / REEL_COUNT) * Math.PI * 2;
      const dist = 40 + Math.random() * 60;
      torus.position.set(
        Math.cos(angle) * dist,
        (Math.random() - 0.5) * 40,
        Math.sin(angle) * dist - 60
      );
      torus.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      torus.userData.spin = 0.05 + Math.random() * 0.15;
      reelGroup.add(torus);
      reels.push(torus);
    }
    scene.add(reelGroup);

    // ===== 3. Dải phim cuộn quanh (film strip) =====
    const stripGroup = new THREE.Group();
    const stripMat = new THREE.MeshBasicMaterial({
      color: 0xffa502,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const STRIP_SEGMENTS = 60;
    for (let i = 0; i < STRIP_SEGMENTS; i++) {
      const t = i / STRIP_SEGMENTS;
      const angle = t * Math.PI * 6;
      const radius = 25 + t * 5;
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(3, 4), stripMat);
      frame.position.set(
        Math.cos(angle) * radius,
        (t - 0.5) * 260,
        Math.sin(angle) * radius - 100
      );
      frame.lookAt(0, frame.position.y, -100);
      stripGroup.add(frame);
    }
    scene.add(stripGroup);

    // ===== 4. Vệt sáng sân khấu (spotlight cone quét chéo) =====
    const beamGroup = new THREE.Group();
    const beamGeo = new THREE.ConeGeometry(18, 220, 32, 1, true);
    const beamMatA = new THREE.MeshBasicMaterial({
      color: 0xffa502,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beamMatB = new THREE.MeshBasicMaterial({
      color: 0xff4757,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beamA = new THREE.Mesh(beamGeo, beamMatA);
    beamA.position.set(-30, 90, -140);
    beamA.rotation.z = Math.PI;
    beamA.rotation.x = 0.4;
    beamGroup.add(beamA);
    const beamB = new THREE.Mesh(beamGeo, beamMatB);
    beamB.position.set(35, 90, -160);
    beamB.rotation.z = Math.PI;
    beamB.rotation.x = -0.35;
    beamGroup.add(beamB);
    scene.add(beamGroup);

    // ===== 5. Logo 3D "PHIMPLAY24" — khối chữ giả lập bằng box, nổi lên cuối cảnh =====
    const logoGroup = new THREE.Group();
    logoGroup.position.set(0, 0, -30);
    logoGroup.scale.set(0.001, 0.001, 0.001); // ẩn ban đầu, sẽ phóng to ở giai đoạn cuối
    const logoMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xff4757,
      emissiveIntensity: 0.6,
      metalness: 0.4,
      roughness: 0.3,
    });
    const ringGeo = new THREE.TorusGeometry(9, 0.4, 16, 64);
    const logoRing = new THREE.Mesh(ringGeo, logoMat);
    logoGroup.add(logoRing);
    const coreGeo = new THREE.IcosahedronGeometry(4, 1);
    const logoCore = new THREE.Mesh(
      coreGeo,
      new THREE.MeshStandardMaterial({
        color: 0xffa502,
        emissive: 0xffa502,
        emissiveIntensity: 0.5,
        metalness: 0.3,
        roughness: 0.2,
      })
    );
    logoGroup.add(logoCore);
    scene.add(logoGroup);

    // ===== Đường bay camera (Catmull-Rom qua nhiều điểm) =====
    const cameraCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 5, 120),
      new THREE.Vector3(30, 15, 60),
      new THREE.Vector3(-25, 25, 10),
      new THREE.Vector3(20, 10, -40),
      new THREE.Vector3(-10, 8, -90),
      new THREE.Vector3(0, 4, -150),
    ]);

    // ===== Render loop =====
    const clock = new THREE.Clock();
    let raf;
    const totalSeconds = duration / 1000;

    const renderLoop = () => {
      const elapsed = clock.getElapsedTime();
      const progress = Math.min(elapsed / totalSeconds, 1);

      // Camera bay dọc đường cong
      const camT = Math.min(progress * 0.92, 0.999);
      const camPos = cameraCurve.getPointAt(camT);
      camera.position.copy(camPos);
      const lookT = Math.min(camT + 0.02, 1);
      const lookPos = cameraCurve.getPointAt(lookT);
      camera.lookAt(lookPos);

      // Xoay các cuộn phim
      reels.forEach((r) => {
        r.rotation.x += r.userData.spin * 0.02;
        r.rotation.y += r.userData.spin * 0.015;
      });

      // Xoay nhẹ dải phim và trường sao
      stripGroup.rotation.y = elapsed * 0.05;
      starField.rotation.y = elapsed * 0.01;

      // Vệt sáng quét chéo qua lại
      beamGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.3;

      // Giai đoạn cuối (80% → 100%): logo phóng to xuất hiện
      if (progress > 0.72) {
        const logoT = Math.min((progress - 0.72) / 0.22, 1);
        const eased = 1 - Math.pow(1 - logoT, 3); // ease-out cubic
        logoGroup.scale.setScalar(eased);
        logoGroup.rotation.y = elapsed * 0.6;
        logoCore.rotation.x = elapsed * 0.8;
      }

      renderer.render(scene, camera);

      if (progress < 1) {
        raf = requestAnimationFrame(renderLoop);
      }
    };
    renderLoop();

    // Hiện dòng chào mừng sau 1 chút
    const welcomeTimer = setTimeout(() => setShowWelcome(true), 900);

    // Tự động kết thúc sau `duration`
    const endTimer = setTimeout(finish, duration);

    // ===== Resize =====
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ===== Cleanup =====
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(welcomeTimer);
      clearTimeout(endTimer);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return (
    <div className={`c3d-overlay ${fadingOut ? 'fading-out' : ''}`}>
      <canvas ref={canvasRef} className="c3d-canvas" />

      <div className={`c3d-welcome ${showWelcome ? 'visible' : ''}`}>
        {username ? `Chào mừng trở lại, ${username}!` : 'Chào mừng đến với Phimplay24'}
      </div>

      {allowSkip && (
        <button type="button" className="c3d-skip-btn" onClick={finish}>
          Bỏ qua ⏭
        </button>
      )}
    </div>
  );
};