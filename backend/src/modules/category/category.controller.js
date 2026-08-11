const categoryService = require("./category.service");
const catchAsync = require("../../utils/catchAsync");
const sendResponse = require("../../utils/response");

/**
 * GET /api/categories?type=INCOME|EXPENSE
 */
const getCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.getUserCategories(
    req.user.id,
    req.query.type
  );
  sendResponse(res, 200, "Categories retrieved.", { categories });
});

/**
 * POST /api/categories
 */
const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.user.id, req.body);
  sendResponse(res, 201, "Category created.", { category });
});

/**
 * PUT /api/categories/:id
 */
const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.user.id,
    req.params.id,
    req.body
  );
  sendResponse(res, 200, "Category updated.", { category });
});

/**
 * DELETE /api/categories/:id
 */
const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.user.id, req.params.id);
  sendResponse(res, 200, "Category deleted.");
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
