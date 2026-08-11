const prisma = require("../../config/database");
const ApiError = require("../../utils/ApiError");

/**
 * Retrieves all categories belonging to the authenticated user.
 * Optionally filters by type (INCOME / EXPENSE).
 */
const getUserCategories = async (userId, typeFilter) => {
  const whereClause = { userId };

  if (typeFilter && ["INCOME", "EXPENSE"].includes(typeFilter)) {
    whereClause.type = typeFilter;
  }

  const categories = await prisma.category.findMany({
    where: whereClause,
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { transactions: true } },
    },
  });

  return categories;
};

/**
 * Creates a new category for the authenticated user.
 */
const createCategory = async (userId, { name, type }) => {
  const category = await prisma.category.create({
    data: { name, type, userId },
    select: { id: true, name: true, type: true, createdAt: true },
  });

  return category;
};

/**
 * Updates an existing category, ensuring it belongs to the user.
 */
const updateCategory = async (userId, categoryId, updateData) => {
  // Verify ownership
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!existing) {
    throw new ApiError(404, "Category not found.");
  }

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: updateData,
    select: { id: true, name: true, type: true, updatedAt: true },
  });

  return category;
};

/**
 * Deletes a category if it belongs to the user and has no transactions.
 */
const deleteCategory = async (userId, categoryId) => {
  // Verify ownership
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    include: { _count: { select: { transactions: true } } },
  });

  if (!existing) {
    throw new ApiError(404, "Category not found.");
  }

  if (existing._count.transactions > 0) {
    throw new ApiError(
      400,
      `Cannot delete category "${existing.name}" because it has ${existing._count.transactions} transaction(s) linked to it. Remove or reassign them first.`
    );
  }

  await prisma.category.delete({ where: { id: categoryId } });
};

module.exports = { getUserCategories, createCategory, updateCategory, deleteCategory };
