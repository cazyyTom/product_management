import { ApiError } from "../utils/ApiError.js";

/**
 * Express global error handler.
 * Must have 4 parameters so Express recognises it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Normalise non-ApiError instances
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error.name === "ValidationError" ? 400 : 500);
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {}).join(", ");
    error = new ApiError(409, `Duplicate value for field(s): ${field}`);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid value for field: ${err.path}`);
  }

  const response = {
    statusCode: error.statusCode,
    message: error.message,
    success: false,
    ...(error.errors?.length && { errors: error.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
