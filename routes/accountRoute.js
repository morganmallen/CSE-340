const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get("/logout", (req, res, next) => {
  try {
    res.clearCookie("jwt")
    req.session.destroy()
    res.redirect("/")
  } catch (error) {
    next(error)
  }
})


router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccount)
);

router.get(
  "/update/:id",
  accountController.buildUpdateAccount
);

router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  accountController.updateAccount
);

router.post(
  "/change-password",
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  accountController.updatePassword
);

module.exports = router;
