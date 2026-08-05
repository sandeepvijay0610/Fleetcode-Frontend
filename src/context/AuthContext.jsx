import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axiosClient from '../api/axiosClient';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function extractErrorMessage(err, fallback) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (err?.message === 'Network Error') {
    return 'Cannot reach the FleetCode server. Check your connection and try again.';
  }
  return fallback;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN));
  const [user, setUser] = useState(readStoredUser);

  const persistSession = useCallback((accessToken, username, squadName) => {
    const userData = { username, squadName: squadName ?? null };
    localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  }, []);

  /** POST /auth/register — creates the account. Does not log the user in. */
  const register = useCallback(async ({ username, password, leetcodeUsername }) => {
    try {
      await axiosClient.post('/auth/register', {
        username,
        password,
        leetcode_username: leetcodeUsername,
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: extractErrorMessage(err, 'Registration failed. Try a different username.') };
    }
  }, []);

  /**
   * GET /auth/verify/{username} — the "radar handshake" that confirms the
   * linked LeetCode profile is real and reachable before the squad trusts
   * this member's submitted stats.
   */
  const verifyRadarHandshake = useCallback(async (username) => {
    try {
      const { data } = await axiosClient.get(`/auth/verify/${encodeURIComponent(username)}`);
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, 'Radar handshake failed. Double-check your LeetCode username.'),
      };
    }
  }, []);

  /** POST /auth/login — returns the JWT + squad context and starts the session. */
  const login = useCallback(async (username, password) => {
    try {
      const { data } = await axiosClient.post('/auth/login', { username, password });
      persistSession(data.access_token, data.username ?? username, data.squadName);
      return { success: true };
    } catch (err) {
      return { success: false, error: extractErrorMessage(err, 'Invalid username or password.') };
    }
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
  }, []);

  /** Lets pages (e.g. after creating/joining/leaving a squad) update the cached squad name. */
  const setSquadName = useCallback((squadName) => {
    setUser((prev) => {
      const next = { ...(prev ?? {}), squadName };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      verifyRadarHandshake,
      logout,
      setSquadName,
    }),
    [token, user, login, register, verifyRadarHandshake, logout, setSquadName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
