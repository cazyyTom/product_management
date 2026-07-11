/**
 * projects.api.js
 * Wrappers around every /api/v1/projects endpoint.
 */
import api from "./axiosInstance";

// ─── Projects ──────────────────────────────────────────────────────────────

// GET  /projects
export const getProjects = () => api.get("/projects");

// POST /projects
export const createProject = (payload) => api.post("/projects", payload);

// GET  /projects/:projectId
export const getProjectById = (projectId) =>
  api.get(`/projects/${projectId}`);

// PUT  /projects/:projectId
export const updateProject = (projectId, payload) =>
  api.put(`/projects/${projectId}`, payload);

// DELETE /projects/:projectId
export const deleteProject = (projectId) =>
  api.delete(`/projects/${projectId}`);

// ─── Members ───────────────────────────────────────────────────────────────

// GET  /projects/:projectId/members
export const getProjectMembers = (projectId) =>
  api.get(`/projects/${projectId}/members`);

// POST /projects/:projectId/members  { email, role }
export const addProjectMember = (projectId, payload) =>
  api.post(`/projects/${projectId}/members`, payload);

// PUT  /projects/:projectId/members/:userId  { role }
export const updateMemberRole = (projectId, userId, role) =>
  api.put(`/projects/${projectId}/members/${userId}`, { role });

// DELETE /projects/:projectId/members/:userId
export const removeProjectMember = (projectId, userId) =>
  api.delete(`/projects/${projectId}/members/${userId}`);
