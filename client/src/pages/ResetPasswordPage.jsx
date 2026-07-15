import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/authApi';
import './login.css';

/* ---- Inline SVG icons ---- */
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') || '';

  // Form states
  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!token.trim()) errs.token = 'Vui lòng cung cấp mã đặt lại mật khẩu';
    if (!newPassword) errs.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (newPassword.length < 8) errs.newPassword = 'Mật khẩu phải từ 8 ký tự trở lên';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await authApi.resetPassword({
        token: token.trim(),
        newPassword: newPassword
      });
      setSuccess(res.message || 'Đặt lại mật khẩu thành công! Quay lại trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Mã đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Title */}
        <div className="login-logo">
          <div className="login-logo-text" style={{ fontSize: '24px' }}>
            Đặt lại mật khẩu
          </div>
        </div>

        <p className="login-subtitle">
          Nhập mật khẩu mới để khôi phục tài khoản của bạn.
        </p>

        {/* Global messages */}
        {error && <div className="login-error"><AlertIcon />{error}</div>}
        {success && <div className="login-success"><CheckIcon />{success}</div>}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Reset Token */}
          <div className="login-field">
            <label className="login-label" htmlFor="reset-token">Mã xác nhận (Token)</label>
            <div className="login-input-wrapper">
              <input
                id="reset-token"
                type="text"
                className={`login-input${fieldErrors.token ? ' error' : ''}`}
                placeholder="Nhập mã token từ email"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={!!urlToken}
              />
            </div>
            {fieldErrors.token && <span className="field-error">{fieldErrors.token}</span>}
          </div>

          {/* New Password */}
          <div className="login-field">
            <label className="login-label" htmlFor="new-password">Mật khẩu mới</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon"><LockIcon /></span>
              <input
                id="new-password"
                type={showPw ? 'text' : 'password'}
                className={`login-input${fieldErrors.newPassword ? ' error' : ''}`}
                placeholder="Ít nhất 8 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {fieldErrors.newPassword && <span className="field-error">{fieldErrors.newPassword}</span>}
          </div>

          {/* Confirm Password */}
          <div className="login-field">
            <label className="login-label" htmlFor="confirm-password">Xác nhận mật khẩu mới</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon"><LockIcon /></span>
              <input
                id="confirm-password"
                type={showPw ? 'text' : 'password'}
                className={`login-input${fieldErrors.confirmPassword ? ' error' : ''}`}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
          </div>

          {/* Submit */}
          <button
            id="btn-reset-submit"
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading && <span className="btn-spinner" />}
            Xác nhận đổi mật khẩu
          </button>
        </form>

        <div className="login-divider">hoặc</div>

        {/* Back to Login */}
        <div className="login-back">
          <Link to="/login">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
