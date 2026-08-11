/**
 * Creates an Express middleware that validates `req.body`
 * against the provided Zod schema.
 *
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @returns {import('express').RequestHandler}
 */
const validate = (schema) => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Forward the ZodError to the global error handler
      return next(result.error);
    }

    // Replace body with parsed (and potentially transformed) data
    req.body = result.data;
    next();
  };
};

module.exports = validate;
