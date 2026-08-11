const authService = require("./auth.service");
const catchAsync = require("../../utils/catchAsync");
const sendResponse = require("../../utils/response");

/**
 * POST /api/auth/register
 * Registers a new user and returns a JWT.
 */
const register = catchAsync(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);
  sendResponse(res, 201, "User registered successfully.", { user, token });
});

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT.
 */
const login = catchAsync(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);
  sendResponse(res, 200, "Login successful.", { user, token });
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
const getMe = catchAsync(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  sendResponse(res, 200, "User profile retrieved.", { user });
});

module.exports = { register, login, getMe };
