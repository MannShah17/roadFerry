var express = require("express");
const authController = require("../controllers/Auth2/auth.controllers");
// const { checkSchema } = require("express-validator");
// const { validate } = require("../middleware/validate.middleware");
// const { signUp } = require("../controllers/Auth2/validations");
const router = express.Router();

router.post(
  "/signup",
//  validate(checkSchema(signUp)),
  authController.signup,
  authController.sendOtp
);

router.get("/verifyotp", authController.verifyOtp);

module.exports = router;
