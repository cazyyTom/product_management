import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

/**
 * Reads the results of express-validator chains and throws an ApiError
 * if any validation failed. Place this AFTER the validator arrays in routes.
 */
export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const extractedErrors = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  throw new ApiError(422, "Validation failed", extractedErrors);
};
