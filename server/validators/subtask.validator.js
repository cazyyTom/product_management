import { body } from "express-validator";

export const createSubtaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Subtask title is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Subtask title must be 2–200 characters"),
];

export const updateSubtaskValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Subtask title must be 2–200 characters"),

  body("isCompleted")
    .optional()
    .isBoolean()
    .withMessage("isCompleted must be a boolean value"),
];
