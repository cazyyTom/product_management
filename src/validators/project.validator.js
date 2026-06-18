import { body } from "express-validator";
import { AvailableUserRoles } from "../config/constants.js";

export const createProjectValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Project name must be 2–100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

export const updateProjectValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Project name must be 2–100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

export const addMemberValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Member email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("role")
    .optional()
    .isIn(AvailableUserRoles)
    .withMessage(`Role must be one of: ${AvailableUserRoles.join(", ")}`),
];

export const updateMemberRoleValidator = [
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(AvailableUserRoles)
    .withMessage(`Role must be one of: ${AvailableUserRoles.join(", ")}`),
];
