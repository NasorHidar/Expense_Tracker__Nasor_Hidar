const prisma = require("../../config/database");
const ApiError = require("../../utils/ApiError");

/**
 * Retrieves transactions for the authenticated user with optional filters.
 *
 * Supported filters (via query params):
 *  - type: INCOME | EXPENSE
 *  - categoryId: UUID of a category
 *  - startDate / endDate: date range for transactionDate
 *  - page / limit: pagination
 */
const getUserTransactions = async (userId, queryParams) => {
  const {
    type,
    categoryId,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sortBy = "transactionDate",
    sortOrder = "desc",
  } = queryParams;

  const whereClause = { userId };

  // Filter by type
  if (type && ["INCOME", "EXPENSE"].includes(type)) {
    whereClause.type = type;
  }

  // Filter by category
  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  // Filter by date range
  if (startDate || endDate) {
    whereClause.transactionDate = {};
    if (startDate) {
      whereClause.transactionDate.gte = new Date(startDate);
    }
    if (endDate) {
      // Set to end of the day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.transactionDate.lte = end;
    }
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Allowed sort fields
  const allowedSortFields = ["transactionDate", "amount", "title", "createdAt"];
  const orderField = allowedSortFields.includes(sortBy) ? sortBy : "transactionDate";
  const orderDirection = sortOrder === "asc" ? "asc" : "desc";

  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: { select: { id: true, name: true, type: true } },
      },
      orderBy: { [orderField]: orderDirection },
      skip,
      take,
    }),
    prisma.transaction.count({ where: whereClause }),
  ]);

  return {
    transactions,
    pagination: {
      page: parseInt(page),
      limit: take,
      totalCount,
      totalPages: Math.ceil(totalCount / take),
    },
  };
};

/**
 * Computes the financial summary for the authenticated user:
 * total income, total expenses, and net balance.
 */
const getTransactionSummary = async (userId) => {
  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = Number(incomeResult._sum.amount || 0);
  const totalExpense = Number(expenseResult._sum.amount || 0);
  const balance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, balance };
};

/**
 * Creates a new transaction for the authenticated user.
 * Validates that the category exists and belongs to the user.
 */
const createTransaction = async (userId, transactionData) => {
  // Verify category belongs to user
  const category = await prisma.category.findFirst({
    where: { id: transactionData.categoryId, userId },
  });

  if (!category) {
    throw new ApiError(404, "Category not found or does not belong to you.");
  }

  // Ensure category type matches transaction type
  if (category.type !== transactionData.type) {
    throw new ApiError(
      400,
      `Category "${category.name}" is of type ${category.type}, but transaction type is ${transactionData.type}.`
    );
  }

  const transaction = await prisma.transaction.create({
    data: { ...transactionData, userId },
    include: {
      category: { select: { id: true, name: true, type: true } },
    },
  });

  return transaction;
};

/**
 * Updates an existing transaction, ensuring it belongs to the user.
 */
const updateTransaction = async (userId, transactionId, updateData) => {
  // Verify ownership
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });

  if (!existing) {
    throw new ApiError(404, "Transaction not found.");
  }

  // If categoryId is being updated, verify it belongs to the user
  if (updateData.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: updateData.categoryId, userId },
    });

    if (!category) {
      throw new ApiError(404, "Category not found or does not belong to you.");
    }

    // Check type consistency
    const transactionType = updateData.type || existing.type;
    if (category.type !== transactionType) {
      throw new ApiError(
        400,
        `Category "${category.name}" is of type ${category.type}, but transaction type is ${transactionType}.`
      );
    }
  }

  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: updateData,
    include: {
      category: { select: { id: true, name: true, type: true } },
    },
  });

  return transaction;
};

/**
 * Deletes a transaction if it belongs to the user.
 */
const deleteTransaction = async (userId, transactionId) => {
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });

  if (!existing) {
    throw new ApiError(404, "Transaction not found.");
  }

  await prisma.transaction.delete({ where: { id: transactionId } });
};

module.exports = {
  getUserTransactions,
  getTransactionSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
