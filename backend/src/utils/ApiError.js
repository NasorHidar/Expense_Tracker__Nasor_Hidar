/**
 * Custom API Error class that carries an HTTP status code.
 * Extends the built-in Error to distinguish operational errors
 * from unexpected programming errors.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
