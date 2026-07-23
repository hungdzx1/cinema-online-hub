import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import './login.css';

/* ---- Inline SVG icons ---- */
const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ======================================================= */

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, user } = useAuth();
  
  // 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');

  const pageTitle = useMemo(() => {
    if (mode === 'register') return 'Đăng Ký Tài Khoản';
    if (mode === 'forgot') return 'Quên Mật Khẩu';
    return 'Đăng Nhập';
  }, [mode]);

  useDocumentTitle(pageTitle);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const resetForm = () => {
    setEmail(''); setPassword(''); setUsername('');
    setError(''); setSuccess(''); setFieldErrors({});
  };

  const switchMode = (m) => { setMode(m); resetForm(); };

  /* ---------- Validation ---------- */
  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email không hợp lệ';

    if (mode !== 'forgot') {
      if (!password) errs.password = 'Vui lòng nhập mật khẩu';
      else if (mode === 'register' && password.length < 8) errs.password = 'Mật khẩu ít nhất 8 ký tự';
    }

    if (mode === 'register' && !username.trim()) errs.username = 'Vui lòng nhập tên đăng nhập';
    return errs;
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await authApi.login({ email, password });
        login(res.accessToken, res.user);
        if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else if (mode === 'register') {
        await authApi.register({ username, email, password });
        setSuccess('Đăng ký thành công! Hãy đăng nhập.');
        switchMode('login');
        setEmail(email); // giữ lại email sau khi chuyển tab
      } else if (mode === 'forgot') {
        const res = await authApi.forgotPassword({ email: email.trim() });
        setSuccess(res.message || 'Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn.');
        setEmail('');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Đã xảy ra lỗi, vui lòng thử lại.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo or Title */}
        {mode === 'forgot' ? (
          <div className="login-logo">
            <div className="login-logo-text" style={{ fontSize: '24px' }}>
              Quên mật khẩu?
            </div>
          </div>
        ) : (
          <div className="login-logo">
            <div className="login-logo-text">
              Phim Hay <span>24h</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        {mode !== 'forgot' && (
          <div className="login-tabs">
            <button
              id="tab-login"
              className={`login-tab${mode === 'login' ? ' active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Đăng nhập
            </button>
            <button
              id="tab-register"
              className={`login-tab${mode === 'register' ? ' active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Đăng ký
            </button>
          </div>
        )}

        <p className="login-subtitle">
          {mode === 'login'
            ? 'Chào mừng trở lại! Đăng nhập để tiếp tục xem phim.'
            : mode === 'register'
            ? 'Tạo tài khoản miễn phí, thưởng thức phim không giới hạn.'
            : 'Nhập email của bạn để chúng tôi gửi mã/link khôi phục mật khẩu.'}
        </p>

        {/* Global messages */}
        {error && <div className="login-error"><AlertIcon />{error}</div>}
        {success && <div className="login-success"><CheckIcon />{success}</div>}

        <form className="login-form" onSubmit={handleSubmit} noValidate>

          {/* Username (register only) */}
          {mode === 'register' && (
            <div className="login-field">
              <label className="login-label" htmlFor="reg-username">Tên đăng nhập</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon"><UserIcon /></span>
                <input
                  id="reg-username"
                  type="text"
                  className={`login-input${fieldErrors.username ? ' error' : ''}`}
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
            </div>
          )}

          {/* Email */}
          <div className="login-field">
            <label className="login-label" htmlFor="auth-email">Email</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon"><EmailIcon /></span>
              <input
                id="auth-email"
                type="email"
                className={`login-input${fieldErrors.email ? ' error' : ''}`}
                placeholder="example@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          {/* Password (login only) */}
          {mode === 'login' && (
            <div className="login-field">
              <label className="login-label" htmlFor="auth-password">Mật khẩu</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon"><LockIcon /></span>
                <input
                  id="auth-password"
                  type={showPw ? 'text' : 'password'}
                  className={`login-input${fieldErrors.password ? ' error' : ''}`}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
              
              {/* Forgot password link */}
              <div className="login-forgot-wrap">
                <button
                  type="button"
                  className="login-forgot-link"
                  onClick={() => switchMode('forgot')}
                >
                  Quên mật khẩu?
                </button>
              </div>
            </div>
          )}

          {/* Password (register only) */}
          {mode === 'register' && (
            <div className="login-field">
              <label className="login-label" htmlFor="reg-password">Mật khẩu</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon"><LockIcon /></span>
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  className={`login-input${fieldErrors.password ? ' error' : ''}`}
                  placeholder="Ít nhất 8 ký tự"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>
          )}

          {/* Submit */}
          <button
            id="btn-auth-submit"
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading && <span className="btn-spinner" />}
            {mode === 'login'
              ? 'Đăng nhập'
              : mode === 'register'
              ? 'Tạo tài khoản'
              : 'Gửi link khôi phục'}
          </button>
        </form>

        {/* Back to Login link (forgot mode only) */}
        {mode === 'forgot' && (
          <div className="login-forgot-wrap" style={{ justifyContent: 'center', marginTop: 18 }}>
            <button
              type="button"
              className="login-forgot-link"
              onClick={() => switchMode('login')}
              style={{ fontSize: '14px', textDecoration: 'underline' }}
            >
              Quay lại đăng nhập
            </button>
          </div>
        )}

        <div className="login-divider">hoặc</div>

        {/* Back to home */}
        <div className="login-back">
          <Link to="/">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Quay về trang chủ
          </Link>
        </div>

      </div>
    </div>
  );
};
