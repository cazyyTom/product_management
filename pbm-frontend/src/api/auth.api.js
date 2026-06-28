/**
 * auth.api.js
 * Thin wrappers around every /api/v1/auth endpoint.
 */
import api from "./axiosInstance";

// POST /auth/register
export const registerUser = (payload) =>
  api.post("/auth/register", payload);

// POST /auth/login  → returns { user, accessToken, refreshToken }
export const loginUser = (payload) =>
  api.post("/auth/login", payload);

// POST /auth/logout
export const logoutUser = () =>
  api.post("/auth/logout");

// GET  /auth/current-user
export const getCurrentUser = () =>
  api.get("/auth/current-user");

// POST /auth/change-password
export const changePassword = (payload) =>
  api.post("/auth/change-password", payload);

// POST /auth/refresh-token  (called internally by interceptor)
export const refreshToken = () =>
  api.post("/auth/refresh-token");

// POST /auth/forgot-password
export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

// POST /auth/reset-password/:resetToken
export const resetPassword = (resetToken, newPassword) =>
  api.post(`/auth/reset-password/${resetToken}`, { newPassword });

// POST /auth/resend-email-verification
export const resendEmailVerification = () =>
  api.post("/auth/resend-email-verification");
