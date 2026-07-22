import { body } from "express-validator";
import { AvailableTaskStatuses } from "../config/constants.js";

export const createTaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Task title must be 2–200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("assignedTo must be a valid user ID"),

  body("status")
    .optional()
    .isIn(AvailableTaskStatuses)
    .withMessage(`Status must be one of: ${AvailableTaskStatuses.join(", ")}`),
];

export const updateTaskValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Task title must be 2–200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("assignedTo must be a valid user ID"),

  body("status")
    .optional()
    .isIn(AvailableTaskStatuses)
    .withMessage(`Status must be one of: ${AvailableTaskStatuses.join(", ")}`),
];
