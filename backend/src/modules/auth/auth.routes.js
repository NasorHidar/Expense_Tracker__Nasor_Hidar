const { Router } = require("express");
const authController = require("./auth.controller");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authenticate");
const { registerSchema, loginSchema } = require("./auth.validation");

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.getMe);

module.exports = router;
