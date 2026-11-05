import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../api/auth.js';
import {
  AUTH_UNAUTHORIZED_EVENT,
  TOKEN_KEY,
} from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authApi.getMe();
        if (!cancelled) setUser(data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateUser,
    }),
    [user, loading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }

  return context;
}
