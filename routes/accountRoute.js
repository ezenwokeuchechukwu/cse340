
// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build registration view
router.get(
	"/register",
	utilities.handleErrors(accountController.buildRegister)
);

// Route to handle Registration
router.post(
	"/register",
	regValidate.registationRules(),
	regValidate.checkRegData,
	utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
	"/login",
	regValidate.loginRules(),
	regValidate.checkLoginData,
	utilities.handleErrors(accountController.accountLogin)
);

// Process logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

// New default route for account management view
router.get(
	"/",
	utilities.checkLogin,
	utilities.handleErrors(accountController.accountManagement)
);

// Route to build account update view
router.get(
	"/update/:account_id",
	utilities.checkLogin,
	utilities.handleErrors(accountController.buildAccountUpdate)
);

// Process account information update
router.post(
	"/update",
	utilities.checkLogin,
	regValidate.updateAccountRules(),
	regValidate.checkAccountUpdate,
	utilities.handleErrors(accountController.updateAccount)
);

// Process password update
router.post(
	"/update/password",
	utilities.checkLogin,
	regValidate.updatePasswordRules(),
	regValidate.checkPassword,
	utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;
