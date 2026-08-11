const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/database");
const env = require("../../config/env");
const ApiError = require("../../utils/ApiError");

const SALT_ROUNDS = 12;

/**
 * Default categories created for every new user upon registration.
 */
const DEFAULT_CATEGORIES = [
  { name: "Salary", type: "INCOME" },
  { name: "Freelance", type: "INCOME" },
  { name: "Investment", type: "INCOME" },
  { name: "Other Income", type: "INCOME" },
  { name: "Food & Dining", type: "EXPENSE" },
  { name: "Transportation", type: "EXPENSE" },
  { name: "Housing & Rent", type: "EXPENSE" },
  { name: "Utilities", type: "EXPENSE" },
  { name: "Healthcare", type: "EXPENSE" },
  { name: "Entertainment", type: "EXPENSE" },
  { name: "Shopping", type: "EXPENSE" },
  { name: "Education", type: "EXPENSE" },
  { name: "Other Expense", type: "EXPENSE" },
];

/**
 * Generates a signed JWT for the given user ID.
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Registers a new user with hashed password and creates default categories.
 */
const registerUser = async ({ fullName, email, password }) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user and default categories in a transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
      select: { id: true, fullName: true, email: true, createdAt: true },
    });

    // Create default categories for the new user
    await tx.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({
        name: cat.name,
        type: cat.type,
        userId: newUser.id,
      })),
    });

    return newUser;
  });

  const token = generateToken(user.id);

  return { user, token };
};

/**
 * Authenticates a user by email and password, returning a JWT.
 */
const loginUser = async ({ email, password }) => {
  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = generateToken(user.id);

  // Return user data without password
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

/**
 * Retrieves the current user's profile by ID.
 */
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true, createdAt: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
};

module.exports = { registerUser, loginUser, getCurrentUser };
