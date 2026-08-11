const { Router } = require("express");
const categoryController = require("./category.controller");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authenticate");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("./category.validation");

const router = Router();

// All category routes require authentication
router.use(authenticate);

router.get("/", categoryController.getCategories);
router.post("/", validate(createCategorySchema), categoryController.createCategory);
router.put("/:id", validate(updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
