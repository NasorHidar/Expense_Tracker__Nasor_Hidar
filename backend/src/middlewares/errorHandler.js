const ApiError = require("../utils/ApiError");
const env = require("../config/env");

/**
 * Global error-handling middleware.
 * Catches all errors forwarded by `next(error)` and sends
 * a consistent JSON error response.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, _req, res, _next) => {
  // Default to 500 Internal Server Error
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  // Handle Prisma known request errors
  if (error.code === "P2002") {
    statusCode = 409;
    const field = error.meta?.target?.[0] || "field";
    message = `A record with this ${field} already exists.`;
  }

  if (error.code === "P2025") {
    statusCode = 404;
    message = "Record not found.";
  }

  // Handle Zod validation errors
  if (error.name === "ZodError") {
    statusCode = 400;
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(statusCode).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  // Log unexpected errors in development
  if (env.NODE_ENV === "development" && statusCode === 500) {
    console.error("🔥 Unhandled Error:", error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === "development" && statusCode === 500
      ? { stack: error.stack }
      : {}),
  });
};

module.exports = errorHandler;
