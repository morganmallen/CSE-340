const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver account view
 * *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();

  if (!req.cookies.jwt) {
      return res.redirect("/account/login?error=Please log in");
  }

  try {
      const decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);

      if (!decoded.account_id || !decoded.account_firstname) {
          console.error("Decoded JWT is missing required fields:", decoded);
          throw new Error("Invalid token data");
      }

      res.render("account/account", { 
          title: "Account Management", 
          nav, 
          user: decoded, 
          errors: null
      });

  } catch (error) {
      console.error("Error processing account page:", error);
      res.redirect("/account/login?error=Authentication failed");
  }
}


/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const {
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    } = req.body;

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );
  
    if (regResult.rows && regResult.rows[0]) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      );
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
      });
    }
  }

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 * Deliver Account Update View
 * **************************************** */
async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav();
  const accountId = req.params.id;

  try {
      const user = await accountModel.getAccountById(accountId);
      if (!user) {
          req.flash("error", "Account not found.");
          return res.redirect("/account/");
      }

      res.render("account/account-update", {
          title: "Update Account Information",
          nav,
          user,
          errors: null,
      });
  } catch (error) {
      console.error("Error fetching account data:", error);
      res.redirect("/account/");
  }
}

/* ****************************************
* Process Account Information Update
* **************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  try {
      const existingAccount = await accountModel.getAccountByEmail(account_email);
      if (existingAccount && existingAccount.account_id !== parseInt(account_id)) {
          req.flash("error", "Email already in use. Choose a different one.");
          return res.render("account/account-update", {
              title: "Update Account Information",
              nav,
              user: req.body,
              errors: null,
          });
      }

      const updateResult = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);

      if (updateResult.rowCount === 1) {
          req.flash("success", "Account updated successfully!");
      } else {
          req.flash("error", "Failed to update account.");
      }

      return res.redirect("/account/");

  } catch (error) {
      console.error("Error updating account:", error);
      req.flash("error", "An error occurred while updating your account.");
      return res.redirect("/account/update/" + account_id);
  }
}

/* ****************************************
* Process Password Change
* **************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;

  try {
      const hashedPassword = await bcrypt.hash(account_password, 10);

      const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

      if (updateResult.rowCount === 1) {
          req.flash("success", "Password updated successfully!");
      } else {
          req.flash("error", "Failed to update password.");
      }

      return res.redirect("/account/");
  } catch (error) {
      console.error("Error updating password:", error);
      req.flash("error", "An error occurred while updating your password.");
      return res.redirect("/account/update/" + account_id);
  }
}
  
  module.exports = { buildLogin, buildRegister, buildAccount, registerAccount, accountLogin, buildUpdateAccount, updateAccount, updatePassword };
