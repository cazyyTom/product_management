/**
 * tasks.api.js
 * Wrappers around every /api/v1/tasks endpoint (tasks + subtasks).
 */
import api from "./axiosInstance";

// ─── Tasks ─────────────────────────────────────────────────────────────────

// GET  /tasks/:projectId
export const getProjectTasks = (projectId) =>
  api.get(`/tasks/${projectId}`);

// POST /tasks/:projectId  (supports FormData for attachments)
export const createTask = (projectId, payload) => {
  // If payload is FormData (has attachments), let the browser set Content-Type
  const isFormData = payload instanceof FormData;
  return api.post(`/tasks/${projectId}`, payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
};

// GET  /tasks/:projectId/t/:taskId
export const getTaskById = (projectId, taskId) =>
  api.get(`/tasks/${projectId}/t/${taskId}`);

// PUT  /tasks/:projectId/t/:taskId
export const updateTask = (projectId, taskId, payload) => {
  const isFormData = payload instanceof FormData;
  return api.put(`/tasks/${projectId}/t/${taskId}`, payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
};

// DELETE /tasks/:projectId/t/:taskId
export const deleteTask = (projectId, taskId) =>
  api.delete(`/tasks/${projectId}/t/${taskId}`);

// ─── Subtasks ──────────────────────────────────────────────────────────────

// POST /tasks/:projectId/t/:taskId/subtasks  { title }
export const createSubtask = (projectId, taskId, payload) =>
  api.post(`/tasks/${projectId}/t/${taskId}/subtasks`, payload);

// PUT  /tasks/:projectId/st/:subTaskId  { title?, isCompleted? }
export const updateSubtask = (projectId, subTaskId, payload) =>
  api.put(`/tasks/${projectId}/st/${subTaskId}`, payload);

// DELETE /tasks/:projectId/st/:subTaskId
export const deleteSubtask = (projectId, subTaskId) =>
  api.delete(`/tasks/${projectId}/st/${subTaskId}`);
