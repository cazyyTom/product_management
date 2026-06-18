import { body } from "express-validator";

export const createNoteValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Note title is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Note title must be 2–200 characters"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Note content is required")
    .isLength({ max: 5000 })
    .withMessage("Note content cannot exceed 5000 characters"),
];

export const updateNoteValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Note title must be 2–200 characters"),

  body("content")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Note content cannot exceed 5000 characters"),
];
