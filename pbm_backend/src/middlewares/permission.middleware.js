import { ProjectMember } from "../models/projectMember.model.js";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UserRolesEnum } from "../config/constants.js";

/**
 * Resolves the project membership for req.user on the given :projectId param.
 * Attaches req.projectMember and req.userRole to the request.
 * Must run AFTER verifyJWT and on routes that have :projectId.
 */
export const getProjectRole = asyncHandler(async (req, _, next) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const membership = await ProjectMember.findOne({
    project: projectId,
    user: req.user._id,
  });

  if (!membership) {
    throw new ApiError(403, "You are not a member of this project");
  }

  req.project = project;
  req.projectMember = membership;
  req.userRole = membership.role;
  next();
});

/**
 * Factory: returns middleware that allows only the specified roles.
 * Must run AFTER getProjectRole.
 * @param {...string} roles - Allowed roles from UserRolesEnum
 */
export const requireRole = (...roles) =>
  asyncHandler(async (req, _, next) => {
    if (!req.userRole) {
      throw new ApiError(403, "Project role not resolved");
    }
    if (!roles.includes(req.userRole)) {
      throw new ApiError(
        403,
        `This action requires one of the following roles: ${roles.join(", ")}`,
      );
    }
    next();
  });

// Convenience shorthands
export const adminOnly = requireRole(UserRolesEnum.ADMIN);
export const adminOrProjectAdmin = requireRole(
  UserRolesEnum.ADMIN,
  UserRolesEnum.PROJECT_ADMIN,
);
export const allRoles = requireRole(
  UserRolesEnum.ADMIN,
  UserRolesEnum.PROJECT_ADMIN,
  UserRolesEnum.MEMBER,
);
