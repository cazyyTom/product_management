/**
 * Wraps an async express route handler and forwards any errors to next().
 * @param {Function} requestHandler - Async (req, res, next) function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export { asyncHandler };
