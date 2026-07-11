/**
 * notes.api.js
 * Wrappers around every /api/v1/notes endpoint.
 */
import api from "./axiosInstance";

// GET  /notes/:projectId
export const getProjectNotes = (projectId) =>
  api.get(`/notes/${projectId}`);

// POST /notes/:projectId  { title, content }
export const createNote = (projectId, payload) =>
  api.post(`/notes/${projectId}`, payload);

// GET  /notes/:projectId/n/:noteId
export const getNoteById = (projectId, noteId) =>
  api.get(`/notes/${projectId}/n/${noteId}`);

// PUT  /notes/:projectId/n/:noteId
export const updateNote = (projectId, noteId, payload) =>
  api.put(`/notes/${projectId}/n/${noteId}`, payload);

// DELETE /notes/:projectId/n/:noteId
export const deleteNote = (projectId, noteId) =>
  api.delete(`/notes/${projectId}/n/${noteId}`);
