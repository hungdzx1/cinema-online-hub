import { createContext } from 'react';

// ============================================================
// AuthContext — chỉ chứa "context object" dùng chung.
// Tách riêng ra file .js (không phải .jsx) để cả AuthProvider và
// hook useAuth cùng import, tránh cảnh báo react-refresh.
// ============================================================
export const AuthContext = createContext(null);