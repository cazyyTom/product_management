import { ApiError } from "../utils/ApiError.js";


const errorHandler = (err, req, res, next) => {
  let error = err;

  // ── 1. MongoDB duplicate key — check FIRST before normalisation ──────────
  if (err.code === 11000) {
    const rawField = Object.keys(err.keyValue || {})[0]; // e.g. "username.type"

    
    const cleanField = rawField ? rawField.split(".")[0] : "Field";

    const message = `${cleanField.charAt(0).toUpperCase() + cleanField.slice(1)} is already taken.`;
    error = new ApiError(409, message);
  }

  // ── 2. Normalise non-ApiError instances ──────────────────────────────────
  else if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error.name === "ValidationError" ? 400 : 500);
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // ── 3. Send response ──────────────────────────────────────────────────────
  const response = {
    statusCode: error.statusCode,
    message: error.message,
    success: false,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
