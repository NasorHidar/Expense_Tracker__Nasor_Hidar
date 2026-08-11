const { z } = require("zod");

const createCategorySchema = z.object({
  name: z
    .string({ required_error: "Category name is required" })
    .min(1, "Category name is required")
    .max(50, "Category name must be at most 50 characters")
    .trim(),
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Type is required",
    invalid_type_error: "Type must be either INCOME or EXPENSE",
  }),
});

const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be at most 50 characters")
    .trim()
    .optional(),
  type: z
    .enum(["INCOME", "EXPENSE"], {
      invalid_type_error: "Type must be either INCOME or EXPENSE",
    })
    .optional(),
});

module.exports = { createCategorySchema, updateCategorySchema };
