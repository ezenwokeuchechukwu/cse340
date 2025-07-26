const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
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
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const {
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    } = req.body;

    const hashedPassword = bcrypt.hashSync(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult.rowCount > 0) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
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
      });
    }
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Process login request
 * *************************************** */
async function accountLogin(req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  try {
    const match = await bcrypt.compare(account_password, accountData.account_password);
    if (!match) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }

    delete accountData.account_password;
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 3600000, // 1 hour
    });

    req.flash("notice", `Welcome ${accountData.account_firstname}`);
    res.locals.loggedin = 1;
    res.locals.accountData = accountData;

    return res.redirect("/account/");
  } catch (error) {
    console.error("Login error:", error);
    throw new Error("Access Forbidden");
  }
}

/* ****************************************
 *  Process logout request
 * *************************************** */
async function accountLogout(req, res) {
  res.clearCookie("jwt");
  res.locals.loggedin = 0;
  res.locals.accountData = null;
  req.flash("notice", "You have been logged out.");
  return res.redirect("/");
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function accountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const accountData = res.locals.accountData;
    res.render("account/accountManagement", {
      title: "Account Management",
      nav,
      accountData,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Deliver account update view
 * *************************************** */
async function buildAccountUpdate(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const account_id = parseInt(req.params.account_id);
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      account_id,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Process Account Update
 * *************************************** */
async function updateAccount(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const {
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    } = req.body;

    const accountResult = await accountModel.updateAccount(
      parseInt(account_id),
      account_firstname,
      account_lastname,
      account_email
    );

    if (accountResult) {
      const updatedAccount = await accountModel.getAccountById(parseInt(account_id));
      const accessToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 3600000,
      });

      res.locals.accountData = updatedAccount;
      req.flash("notice", "The account information has been successfully updated.");
      res.redirect("/account/");
    } else {
      req.flash("notice", "Sorry, the update failed.");
      res.status(501).render("account/update-account", {
        title: "Edit Account",
        nav,
        errors: null,
        ...req.body,
      });
    }
  } catch (error) {
    console.error("Update error:", error);
    next(error);
  }
}

/* ****************************************
 *  Process Password Update
 * *************************************** */
async function updatePassword(req, res, next) {
  const nav = await utilities.getNav();
  const { account_id, account_password } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(account_password, 10);

    const result = await accountModel.updatePassword(account_id, hashedPassword);

    if (result) {
      req.flash("notice", "The password has been successfully updated.");
      res.redirect("/account/");
    } else {
      req.flash("notice", "Sorry, the password update failed.");
      res.status(501).render("account/update-account", {
        title: "Edit Account",
        nav,
        errors: null,
        account_id,
      });
    }
  } catch (error) {
    req.flash("notice", "Sorry, there was an error updating your password.");
    res.status(500).render("account/update-account", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  accountLogout,
  accountManagement,
  buildAccountUpdate,
  updateAccount,
  updatePassword,
};
