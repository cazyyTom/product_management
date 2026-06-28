/**
 * AuthContext.jsx
 *
 * Central authentication state for the entire app.
 *
 * Responsibilities:
 *  - Bootstrap: on first mount, call /auth/current-user to restore session
 *    (the HttpOnly refreshToken cookie keeps the user logged in across reloads).
 *  - Expose: user, isAuthenticated, isLoading, login(), register(), logout()
 *  - Listen to the "auth:logout" event fired by the Axios interceptor when a
 *    token refresh fails, so we can clear state without a circular import.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
} from "@/api/auth.api";
import { setAccessToken, clearAccessToken } from "@/api/axiosInstance";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true during bootstrap
  const [error, setError]       = useState(null);

  // Prevent double-bootstrap in React 19 StrictMode double-invoke
  const bootstrapped = useRef(false);

  // ── Bootstrap: restore session on page load ──────────────────────────────
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    (async () => {
      try {
        // The refresh-token cookie is HttpOnly, so we can't read it, but the
        // browser will send it automatically. If it's valid the server issues
        // a new accessToken and we can fetch the current user.
        const res = await getCurrentUser();
        setUser(res.data.data.user);
      } catch {
        // No valid session — user stays null (not authenticated).
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Listen for forced logout from the Axios interceptor ─────────────────
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      clearAccessToken();
    };
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    setError(null);
    const res = await loginUser({ email, password });
    const { user: loggedIn, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async ({ username, email, password }) => {
    setError(null);
    const res = await registerUser({ username, email, password });
    return res.data; // caller shows the "verify email" message
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Swallow – we clear client state regardless
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    setUser, // exposed so profile update pages can patch the user object
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
