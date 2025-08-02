const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const pool = require("../database/")
const validate = {}

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
    return [
        body("account_firstname")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name.")
            .isAlpha()
            .withMessage("First name must contain only letters")
            .custom((value) => {
                if (value.length === 0) {
                    throw new Error('First name is required');
                }
                return true;
            }),

        body("account_lastname")
            .trim()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name.")
            .isAlpha()
            .withMessage("Last name must contain only letters")
            .custom((value) => {
                if (value.length === 0) {
                    throw new Error('Last name is required');
                }
                return true;
            }),

        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists){
                    throw new Error("Email exists. Please log in or use different email")
                }
            }),

        body("account_password")
            .trim()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements.")
            .custom((value) => {
                if (value.length === 0) {
                    throw new Error('Password is required');
                }
                return true;
            })
    ]
}

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
    return [
        // valid email is required
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required."),

        // password is required
        body("account_password")
            .trim()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements.")
    ]
}

/* **************************************
* Update Account Data Validation Rules
* ************************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name.")
      .isAlpha()
      .withMessage("First name must contain only letters"),
    
    body("account_lastname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name.")
      .isAlpha()
      .withMessage("Last name must contain only letters"),
    
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
  ]
}

/* **************************************
* Update Password Validation Rules
* ************************************* */
validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        })
        return
    }
    next()
}

/* **************************************
* Check account data update
* ************************************* */
validate.checkAccountData = async (req, res, next) => {
  const { account_email } = req.body
  const accountId = parseInt(req.body.account_id)
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render("account/update-account", {
      title: "Update Account",
      nav: await utilities.getNav(),
      errors: errors.array(),
    })
  }
  next()
}

/* **************************************
* Check password update
* ************************************* */
validate.checkPassword = async (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render("account/update-account", {
      title: "Update Account",
      nav: await utilities.getNav(),
      errors: errors.array(),
    })
  }
  next()
}

/* **************************************
* Check existing email in update
* ************************************* */
validate.checkExistingEmail = async (account_email, account_id) => {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1 AND account_id != $2"
    const email = await pool.query(sql, [account_email, account_id])
    return email.rowCount
  } catch (error) {
    console.error("Error checking email:", error)
    return 0
  }
}

/* **************************************
* Check account data update
* ************************************* */
validate.checkAccountUpdate = async (req, res, next) => {
  const { account_email, account_id } = req.body
  let errors = []
  
  const emailExists = await validate.checkExistingEmail(account_email, account_id)
  
  if (emailExists) {
    errors.push({ msg: "Email exists. Please use a different email." })
  }

  let validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    errors = [...errors, ...validationErrors.array()]
  }

  if (errors.length) {
    let nav = await utilities.getNav()
    res.render("account/update-account", {
      errors,
      title: "Edit Account",
      nav,
      ...req.body
    })
    return
  }
  next()
}

module.exports = validate
