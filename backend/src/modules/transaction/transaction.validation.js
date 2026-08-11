const { z } = require("zod");

const createTransactionSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters")
    .trim(),
  amount: z
    .number({ required_error: "Amount is required", invalid_type_error: "Amount must be a number" })
    .positive("Amount must be a positive number")
    .max(999999999999, "Amount is too large"),
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Type is required",
    invalid_type_error: "Type must be either INCOME or EXPENSE",
  }),
  categoryId: z
    .string({ required_error: "Category is required" })
    .uuid("Invalid category ID"),
  transactionDate: z
    .string({ required_error: "Transaction date is required" })
    .datetime({ message: "Invalid date format. Use ISO 8601 format." })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD."))
    .transform((val) => new Date(val)),
});

const updateTransactionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters")
    .trim()
    .optional(),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be a positive number")
    .max(999999999999, "Amount is too large")
    .optional(),
  type: z
    .enum(["INCOME", "EXPENSE"], {
      invalid_type_error: "Type must be either INCOME or EXPENSE",
    })
    .optional(),
  categoryId: z
    .string()
    .uuid("Invalid category ID")
    .optional(),
  transactionDate: z
    .string()
    .datetime({ message: "Invalid date format." })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format."))
    .transform((val) => new Date(val))
    .optional(),
});

module.exports = { createTransactionSchema, updateTransactionSchema };
