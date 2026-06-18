import { Router } from "express";
import {
  getProjectTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";
import {
  createSubTask,
  updateSubTask,
  deleteSubTask,
} from "../controllers/subtask.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getProjectRole,
  adminOrProjectAdmin,
  allRoles,
} from "../middlewares/permission.middleware.js";
import { upload, handleMulterError } from "../middlewares/multer.middleware.js";
import {
  createTaskValidator,
  updateTaskValidator,
} from "../validators/task.validator.js";
import {
  createSubtaskValidator,
  updateSubtaskValidator,
} from "../validators/subtask.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.use(verifyJWT);

// ─── Tasks ─────────────────────────────────────────────────────────────────────
// GET  /api/v1/tasks/:projectId
// POST /api/v1/tasks/:projectId
router
  .route("/:projectId")
  .get(getProjectRole, allRoles, getProjectTasks)
  .post(
    getProjectRole,
    adminOrProjectAdmin,
    upload.array("attachments", 5),
    handleMulterError,
    createTaskValidator,
    validate,
    createTask,
  );

// GET    /api/v1/tasks/:projectId/t/:taskId
// PUT    /api/v1/tasks/:projectId/t/:taskId
// DELETE /api/v1/tasks/:projectId/t/:taskId
router
  .route("/:projectId/t/:taskId")
  .get(getProjectRole, allRoles, getTaskById)
  .put(
    getProjectRole,
    adminOrProjectAdmin,
    upload.array("attachments", 5),
    handleMulterError,
    updateTaskValidator,
    validate,
    updateTask,
  )
  .delete(getProjectRole, adminOrProjectAdmin, deleteTask);

// ─── Subtasks ──────────────────────────────────────────────────────────────────
// POST /api/v1/tasks/:projectId/t/:taskId/subtasks
router.post(
  "/:projectId/t/:taskId/subtasks",
  getProjectRole,
  adminOrProjectAdmin,
  createSubtaskValidator,
  validate,
  createSubTask,
);

// PUT    /api/v1/tasks/:projectId/st/:subTaskId  (all roles — Members can mark complete)
// DELETE /api/v1/tasks/:projectId/st/:subTaskId  (admin / project admin only)
router
  .route("/:projectId/st/:subTaskId")
  .put(
    getProjectRole,
    allRoles,
    updateSubtaskValidator,
    validate,
    updateSubTask,
  )
  .delete(getProjectRole, adminOrProjectAdmin, deleteSubTask);

export default router;
