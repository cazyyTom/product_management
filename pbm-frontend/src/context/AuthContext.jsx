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
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const bootstrapped              = useRef(false);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  // On every page load the in-memory accessToken is gone.
  // STEP 1: Call /refresh-token with the HttpOnly cookie to get a new accessToken.
  // STEP 2: Use that token to call /current-user.
  // If either fails → user is not logged in → stay on null (ProtectedRoute
  //   will redirect to /login cleanly, no hard reload).
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    (async () => {
      try {
        // Step 1 — get a fresh access token from the refresh cookie
        const refreshRes = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const newToken = refreshRes.data?.data?.accessToken;
        if (!newToken) throw new Error("No token in refresh response");
        setAccessToken(newToken);

        // Step 2 — now fetch the user (token is in memory, interceptor will attach it)
        const userRes = await getCurrentUser();
        setUser(userRes.data?.data?.user ?? null);
      } catch {
        // No valid session — not logged in. This is normal, not an error.
        clearAccessToken();
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
    return res.data;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Swallow – clear client state regardless
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
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
