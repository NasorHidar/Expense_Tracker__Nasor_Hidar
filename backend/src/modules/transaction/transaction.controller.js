const transactionService = require("./transaction.service");
const catchAsync = require("../../utils/catchAsync");
const sendResponse = require("../../utils/response");

/**
 * GET /api/transactions
 * Supports query params: type, categoryId, startDate, endDate, page, limit, sortBy, sortOrder
 */
const getTransactions = catchAsync(async (req, res) => {
  const result = await transactionService.getUserTransactions(
    req.user.id,
    req.query
  );
  sendResponse(res, 200, "Transactions retrieved.", result);
});

/**
 * GET /api/transactions/summary
 * Returns totalIncome, totalExpense, and balance.
 */
const getSummary = catchAsync(async (req, res) => {
  const summary = await transactionService.getTransactionSummary(req.user.id);
  sendResponse(res, 200, "Financial summary retrieved.", { summary });
});

/**
 * POST /api/transactions
 */
const createTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.createTransaction(
    req.user.id,
    req.body
  );
  sendResponse(res, 201, "Transaction created.", { transaction });
});

/**
 * PUT /api/transactions/:id
 */
const updateTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.updateTransaction(
    req.user.id,
    req.params.id,
    req.body
  );
  sendResponse(res, 200, "Transaction updated.", { transaction });
});

/**
 * DELETE /api/transactions/:id
 */
const deleteTransaction = catchAsync(async (req, res) => {
  await transactionService.deleteTransaction(req.user.id, req.params.id);
  sendResponse(res, 200, "Transaction deleted.");
});

module.exports = {
  getTransactions,
  getSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
