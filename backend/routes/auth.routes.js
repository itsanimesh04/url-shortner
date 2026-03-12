const express = require("express");
const router = express.Router() ;

const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");

const {loginSchema, signupSchema} = require("../validators/auth.validator");

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);

module.exports = router;