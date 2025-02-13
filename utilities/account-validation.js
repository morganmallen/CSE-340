const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};

/* ****************************************
 * Validation for Updating Account Info
 * **************************************** */
validate.updateAccountRules = () => [
  body("account_firstname")
    .trim()
    .notEmpty()
    .withMessage("First name is required."),
  body("account_lastname")
    .trim()
    .notEmpty()
    .withMessage("Last name is required."),
  body("account_email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address.")
    .custom(async (email, { req }) => {
      const existingAccount = await accountModel.getAccountByEmail(email);
      if (
        existingAccount &&
        existingAccount.account_id !== parseInt(req.body.account_id)
      ) {
        throw new Error("Email already in use.");
      }
    }),
];

/* ****************************************
 * Validation for Password Change
 * **************************************** */
validate.passwordRules = () => [
  body("account_password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/\d/)
    .withMessage("Password must contain a number.")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter."),
];

/* ******************************
 * Check data for account update
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update-account", {
      errors,
      title: "Update Account",
      nav,
      user: {
        account_firstname,
        account_lastname,
        account_email,
        account_id: req.body.account_id
      },
    });
    return;
  }
  next();
};

/* ******************************
 * Check data for password update
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update-account", {
      errors,
      title: "Update Account",
      nav,
      user: {
        account_id: req.body.account_id
      },
    });
    return;
  }
  next();
};

module.exports = validate;
