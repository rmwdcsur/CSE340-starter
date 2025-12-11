const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator");
require("dotenv").config()


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}



/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
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
  )

  if (regResult) {
    req.flash(
      "success",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
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

/* *****************************************
 * Process account management get request 
 * *************************************** */
async function buildAccountManagementView(req, res) {
  let nav = await utilities.getNav();
  

  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
  });
  return; 
}

/* ****************************************
*  Edit account view
* *************************************** */
async function buildEditAccountView(req, res, next) {
  try {
    const account_id = req.params.account_id;
    const nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);

    if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account/edit/" + account_id);
    }

    // Render edit form with pre-filled values
    res.render("account/edit", {
      title: "Edit Account",
      nav,
      errors: null,
      accountData
    });

  } catch (error) {
    next(error);
  }
}

/* ****************************************
*  Update account information
* *************************************** */
async function updateAccount(req, res, next) {
  try {
    const account_id = req.params.account_id;
    const { account_firstname, account_lastname,  account_email } = req.body; 
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );  
    if (updateResult) {
      req.flash("success", "Account updated successfully.");
      //Refresh view with updated info
      const refreshedAccount = await accountModel.getAccountById(account_id);
      req.session.accountData = refreshedAccount;
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Account update failed.");
      return res.redirect("/account/edit/" + account_id);
    }
  } catch (error) {
    next(error);
  }
}

/* ****************************************
*  Update account password
* *************************************** */
async function updatePassword(req, res, next) {
 const account_id = req.params.account_id;

  const { account_password, retype_account_password } = req.body;

  // Express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("notice", errors.array()[0].msg);
    return res.redirect("/account/change-password/" + account_id);
  }

  // Match check
  if (account_password !== retype_account_password) {
    req.flash("notice", "Passwords do not match.");
    return res.redirect("/account/change-password/" + account_id);
  }

    // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
    title: "Registration",
    nav,
    errors: null,
    })
  }  

  const updateResult = await accountModel.updatePassword(
    account_id,
    hashedPassword
  );

  if (updateResult) {
    req.flash("success", "Password updated successfully.");
    return res.redirect("/account/");
  } else {
    req.flash("notice", "Password update failed.");
    return res.redirect("/account/change-password/" + account_id);
  }
}

/* *****************************************
 * Process ADMIN account management
 * *************************************** */
async function buildAdminAccountManagementView(req, res) {
  let nav = await utilities.getNav();
  let accounts = await accountModel.getAllAccounts();

  res.render("account/manage", {
    title: "Account Management",
    nav,
    accounts,
    errors: null,
  });
  return; 
}

/* *****************************
* Update an account type
***************************** */
async function updateAccountType(req, res) {
  const changedAccountId = req.params.account_id;
  const newType = req.body.account_type;
  const accountData = res.locals.accountData;
  const adminId = accountData.account_id;

  try {
    await accountModel.updateAccountType(changedAccountId, newType, adminId);

    req.flash("success", "Account type updated successfully.");
    res.redirect("/account/manage");
  } catch (err) {
    console.error(err);
    req.flash("notice", err.message || "Error updating account type.");
    res.redirect("/account/manage");
  }
}

/* *****************************
* Toggle account deleted state
***************************** */
async function toggleDeleteAccount(req, res) {
  const accountId = req.params.account_id;
  const currentState = parseInt(req.body.current_state);
  const newState = currentState === 1 ? 0 : 1;
  const accountData = res.locals.accountData;
  const adminId = accountData.account_id;

  try {
    await accountModel.toggleAccountDeleted(accountId, newState, adminId);
    if (newState === 1) {
      req.flash("success", "Account has been disabled.");
    } else {
      req.flash("success", "Account has been restored.");
    }    
    res.redirect("/account/manage");

  } catch (error) {
    console.error("Controller error:", error);
    req.flash("notice", "Could not disable or restore the account.");
    res.redirect("/account/manage");
  }
}

/* *****************************************
 * Process ADMIN account management
 * *************************************** */
async function buildAuditView(req, res) {
  let nav = await utilities.getNav();
  let records = await accountModel.getRecentAuditRecords();
  let formattedRecords = records.map(r => ({
  ...r,
  formatted_date: new Date(r.date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  })
}));

  res.render("account/changelog", {
    title: "Account Management Changes",
    nav,
    formattedRecords,
    errors: null,
  });
  return; 
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagementView, buildEditAccountView, updateAccount, updatePassword, buildAdminAccountManagementView, updateAccountType, toggleDeleteAccount, buildAuditView };