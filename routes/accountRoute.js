// Needed resources
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

// Route to build the login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to process registration data
router.post(
    '/register',
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount));

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)  
);

// Route to process logout
router.get("/logout", (req, res, next) => {
  res.clearCookie("jwt");
  req.flash("success", "You have been logged out.");
  res.redirect("/");
});

// Route to Edit Account
router.get("/edit/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildEditAccountView));

// Route to Update Account
router.post(
  "/update/:account_id",
  utilities.checkLogin,
  regValidate.checkRegData,
  utilities.handleErrors(accountController.updateAccount)
);

//Route to build change password view
router.get("/change-password/:account_id", utilities.checkLogin, async (req, res, next) => {
  try {
    const account_id = req.params.account_id;
    const nav = await utilities.getNav();
    const accountData = await require("../models/account-model").getAccountById(account_id);

    res.render("account/change-password", {
      title: "Change Password",
      nav,
      accountData,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
});

//Route to process change password request
router.post(
  "/change-password/:account_id",
  utilities.checkLogin,
  regValidate.passwordUpdate(),
  utilities.handleErrors(accountController.updatePassword)
);

  //Route to build the account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagementView));

//Route to build the account management view for admin
router.get("/manage", utilities.checkLogin, utilities.requireAdmin, utilities.handleErrors(accountController.buildAdminAccountManagementView));

//Route to update PROMOTE OR DEMOTE accounts by admin
router.post(
  "/update-type/:account_id",
  utilities.requireAdmin,
  utilities.handleErrors(accountController.updateAccountType)
);


//Route to toggle account deletion state by admin
router.post(
  "/toggle-account-status/:account_id",
  utilities.requireAdmin,
  utilities.handleErrors(accountController.toggleDeleteAccount)
);

//Route to view account changelog by admin
router.get("/changelog", utilities.requireAdmin, utilities.handleErrors(accountController.buildAuditView));

module.exports = router;