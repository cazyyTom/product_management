/**
 * healthcheck.api.js
 * Wrapper around /api/v1/healthcheck.
 */
import api from "./axiosInstance";

// GET /healthcheck
export const getHealthStatus = () => api.get("/healthcheck");
