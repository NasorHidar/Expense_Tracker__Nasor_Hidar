const { Router } = require("express");
const transactionController = require("./transaction.controller");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authenticate");
const {
  createTransactionSchema,
  updateTransactionSchema,
} = require("./transaction.validation");

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

// Summary must be defined before /:id to avoid route conflict
router.get("/summary", transactionController.getSummary);

router.get("/", transactionController.getTransactions);
router.post("/", validate(createTransactionSchema), transactionController.createTransaction);
router.put("/:id", validate(updateTransactionSchema), transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
