/**
 * Wraps an async route handler to catch rejected promises
 * and forward them to Express's error-handling middleware.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
