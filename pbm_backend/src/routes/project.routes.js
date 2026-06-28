import { Router } from "express";
import {
  getUserProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeProjectMember,
} from "../controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getProjectRole,
  adminOnly,
  allRoles,
} from "../middlewares/permission.middleware.js";
import {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
  updateMemberRoleValidator,
} from "../validators/project.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

// All project routes require authentication
router.use(verifyJWT);

// /api/v1/projects/
router
  .route("/")
  .get(getUserProjects)
  .post(createProjectValidator, validate, createProject);

// /api/v1/projects/:projectId  — resolve role first
router
  .route("/:projectId")
  .get(getProjectRole, allRoles, getProjectById)
  .put(
    getProjectRole,
    adminOnly,
    updateProjectValidator,
    validate,
    updateProject,
  )
  .delete(getProjectRole, adminOnly, deleteProject);

// /api/v1/projects/:projectId/members
router
  .route("/:projectId/members")
  .get(getProjectRole, allRoles, getProjectMembers)
  .post(
    getProjectRole,
    adminOnly,
    addMemberValidator,
    validate,
    addProjectMember,
  );

// /api/v1/projects/:projectId/members/:userId
router
  .route("/:projectId/members/:userId")
  .put(
    getProjectRole,
    adminOnly,
    updateMemberRoleValidator,
    validate,
    updateMemberRole,
  )
  .delete(getProjectRole, adminOnly, removeProjectMember);

export default router;
