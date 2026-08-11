/**
 * Sends a standardized JSON success response.
 *
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable success message
 * @param {object} [data] - Optional response payload
 */
const sendResponse = (res, statusCode, message, data = undefined) => {
  const responseBody = {
    success: true,
    message,
  };

  if (data !== undefined) {
    responseBody.data = data;
  }

  return res.status(statusCode).json(responseBody);
};

module.exports = sendResponse;
