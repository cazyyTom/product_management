/**
 * axiosInstance.js
 *
 * Central Axios instance for all API calls.
 *
 * Features:
 *  - Base URL from .env (VITE_API_BASE_URL)
 *  - Sends cookies (withCredentials) so the HttpOnly JWT cookies are included
 *  - Request interceptor: attaches the in-memory accessToken to every request
 *  - Response interceptor: on 401, silently refreshes the token via
 *    /api/v1/auth/refresh-token, retries the original request once, and
 *    redirects to /login if the refresh also fails.
 */

import axios from "axios";

// ─── In-memory token store ─────────────────────────────────────────────────
// We keep the accessToken in JS memory (not localStorage) to avoid XSS leaks.
// The refreshToken lives in an HttpOnly cookie that the browser sends
// automatically; we never read it on the client.
let _accessToken = null;

export const setAccessToken = (token) => {
  _accessToken = token;
};

export const getAccessToken = () => _accessToken;

export const clearAccessToken = () => {
  localStorage.removeItem("token");
  // Let AuthContext handle the state update and React Router handle the redirect
};

// ─── Axios instance ────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  withCredentials: true,          // send/receive HttpOnly cookies
  timeout: 15_000,                // 15 s global timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor ───────────────────────────────────────────────────
// Attach the current in-memory access token before every request.
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
// Track whether we're already refreshing to prevent cascading refresh loops.
let _isRefreshing = false;
let _pendingQueue = []; // requests waiting for the new token

const processQueue = (error, token = null) => {
  _pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  _pendingQueue = [];
};

api.interceptors.response.use(
  // ── Success: pass through ──────────────────────────────────────────────
  (response) => response,

  // ── Error: handle 401 with token refresh ──────────────────────────────
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and only once per request (_retry flag).
   if (
     error.response?.status === 401 &&
     !error.config.url.includes("/auth/current-user")
   ) {
     window.dispatchEvent(new Event("auth:logout"));
   }

    // Mark this request so we don't retry more than once.
    originalRequest._retry = true;

    // If a refresh is already in-flight, queue this request.
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

    // ── Start the refresh flow ─────────────────────────────────────────
    _isRefreshing = true;

    try {
      // The refresh token lives in an HttpOnly cookie — just call the endpoint.
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"}/auth/refresh-token`,
        {},
        { withCredentials: true },
      );

      const newToken = data.data?.accessToken;
      setAccessToken(newToken);

      // Retry all queued requests with the new token.
      processQueue(null, newToken);

      // Retry the original request.
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      if (refreshError.response?.status === 401) {
        clearAccessToken();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        window.location.href = "/login";
      }

      return Promise.reject(normaliseError(refreshError));
    } finally {
      _isRefreshing = false;
    }
  },
);

// ─── Error normalisation ───────────────────────────────────────────────────
// Convert Axios errors into a consistent shape that the UI can consume.
export function normaliseError(error) {
  if (error.response) {
    // Server responded with a non-2xx status
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
    // Request was made but no response received
    const networkErr = new Error(
      "Unable to reach the server. Please check your internet connection.",
    );
    networkErr.status = 0;
    return networkErr;
  }

  // Something else happened
  return error;
}

export default api;
