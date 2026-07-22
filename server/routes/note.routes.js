import { Router } from "express";
import {
  getProjectNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
} from "../controllers/note.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getProjectRole,
  adminOnly,
  allRoles,
} from "../middlewares/permission.middleware.js";
import {
  createNoteValidator,
  updateNoteValidator,
} from "../validators/note.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.use(verifyJWT);

// GET  /api/v1/notes/:projectId
// POST /api/v1/notes/:projectId
router
  .route("/:projectId")
  .get(getProjectRole, allRoles, getProjectNotes)
  .post(getProjectRole, adminOnly, createNoteValidator, validate, createNote);

// GET    /api/v1/notes/:projectId/n/:noteId
// PUT    /api/v1/notes/:projectId/n/:noteId
// DELETE /api/v1/notes/:projectId/n/:noteId
router
  .route("/:projectId/n/:noteId")
  .get(getProjectRole, allRoles, getNoteById)
  .put(getProjectRole, adminOnly, updateNoteValidator, validate, updateNote)
  .delete(getProjectRole, adminOnly, deleteNote);

export default router;
