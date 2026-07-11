import axios from "axios";

// ─── In-memory token store ─────────────────────────────────────────────────
let _accessToken = null;

export const setAccessToken = (token) => { _accessToken = token; };
export const getAccessToken = () => _accessToken;
export const clearAccessToken = () => { _accessToken = null; };

// ─── Axios instance ────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  withCredentials: true,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────────────────────
let _isRefreshing = false;
let _pendingQueue = [];

const processQueue = (error, token = null) => {
  _pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  _pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ── CRITICAL FIX 1 ────────────────────────────────────────────────────
    // Do NOT attempt token refresh for these routes — they are either the
    // auth endpoints themselves, or the bootstrap call. Retrying them would
    // cause the infinite redirect loop.
    const skipRefreshUrls = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh-token",
      "/auth/current-user",   // ← bootstrap call; if this 401s, user is not logged in
    ];
    const isSkipUrl = skipRefreshUrls.some((url) =>
      originalRequest.url?.includes(url),
    );

    if (error.response?.status !== 401 || originalRequest._retry || isSkipUrl) {
      return Promise.reject(normaliseError(error));
    }

    // Mark so we don't retry more than once
    originalRequest._retry = true;

    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _pendingQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    _isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "/api/v1"}/auth/refresh-token`,
        {},
        { withCredentials: true },
      );

      const newToken = data.data?.accessToken;
      setAccessToken(newToken);
      processQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // ── CRITICAL FIX 2 ────────────────────────────────────────────────
      // Only force-redirect if the user WAS logged in (token existed).
      // If they were never logged in, just clear state silently — let the
      // ProtectedRoute handle the redirect gracefully without a hard reload.
      processQueue(refreshError, null);
      clearAccessToken();
      window.dispatchEvent(new CustomEvent("auth:logout"));

      // Use soft navigation instead of hard reload to prevent the loop
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(normaliseError(refreshError));
    } finally {
      _isRefreshing = false;
    }
  },
);

export function normaliseError(error) {
  if (error.response) {
    const serverMsg =
      error.response.data?.message ||
      error.response.data?.error ||
      "An unexpected error occurred.";
    const normalised = new Error(serverMsg);
    normalised.status = error.response.status;
    normalised.data = error.response.data;
    return normalised;
  }
  if (error.request) {
    const networkErr = new Error(
      "Unable to reach the server. Please check your internet connection.",
    );
    networkErr.status = 0;
    return networkErr;
  }
  return error;
}

export default api;
