import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

const TOKEN_KEY = 'cinema_access_token';
const USER_KEY  = 'cinema_user';
const LAST_ACTIVITY_KEY = 'cinema_last_activity';
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 phút (milliseconds)

export const AuthProvider = ({ children }) => {
  const toast = useToast();
  const [user, setUser]   = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const lastUpdateRef = useRef(0);

  // Ghi vào localStorage mỗi khi user/token thay đổi
  useEffect(() => {
    if (token && user) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      }
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    }
  }, [token, user]);

  const login = useCallback((accessToken, userData) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }, []);

  const logout = useCallback((reason) => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    if (reason === 'inactivity' && toast) {
      toast.warning('Phiên đăng nhập đã hết hạn do bạn không hoạt động trong 15 phút.');
    }
  }, [toast]);

  // Cập nhật một phần thông tin user (không cần truyền lại token)
  const updateUser = useCallback((partialUser) => {
    setUser(prev => prev ? { ...prev, ...partialUser } : prev);
  }, []);

  // Tự động đăng xuất sau 15 phút không hoạt động
  useEffect(() => {
    if (!token || !user) return;

    // Reset thời gian hoạt động khi người dùng tương tác
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle: chỉ cập nhật localStorage mỗi 2 giây để tối ưu hiệu năng
      if (now - lastUpdateRef.current > 2000) {
        lastUpdateRef.current = now;
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      }
    };

    // Kiểm tra xem đã hết 15 phút không hoạt động chưa
    const checkInactivity = () => {
      const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
      const lastActivity = lastActivityStr ? Number(lastActivityStr) : Date.now();
      if (Date.now() - lastActivity >= INACTIVITY_TIMEOUT) {
        logout('inactivity');
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, handleUserActivity, { passive: true }));

    // Kiểm tra định kỳ mỗi 5 giây
    const interval = setInterval(checkInactivity, 5000);

    // Kiểm tra ngay khi quay lại tab (visibilitychange / focus)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkInactivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [token, user, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>');
  return ctx;
};
