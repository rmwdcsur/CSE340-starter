const pool = require("../database/")


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1 AND deleted = 0',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("Either no matching email found or the account is inactive")
  }
}

/* *****************************
* Return account data by account ID
* ***************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching account found")
  }
}

/* *****************************
* Return account data by account ID
* ***************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4";
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    return result.rowCount > 0;
  } catch (error) {
    return error.message;
  }
}

/* *****************************
* Update account password
* ***************************** */
async function updatePassword(account_id, account_password) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2";
    const result = await pool.query(sql, [account_password, account_id]);
    return result.rowCount > 0;
  } catch (error) {
    return error.message;
  }
}

/* *****************************
* Return accounts to promote or demote
* ***************************** */
async function getAllAccounts () {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, deleted FROM account ORDER BY 1 DESC')
    return result.rows
  } catch (error) {
    throw new Error("No accounts found")
  }
}

/* *****************************
* Update an account type
* ***************************** */
/* async function updateAccountType(account_id, account_type) {
  try {
    const sql = "UPDATE account SET account_type = $1 WHERE account_id = $2";
    const result = await pool.query(sql, [account_type, account_id]);
    return result.rowCount > 0;
  } catch (error) {
    return error.message;
  }
} */

/* *****************************
* Update an account type with audit
* ***************************** */
async function updateAccountType(changedAccountId, newType, adminId) {  

  try {
    await pool.query("BEGIN");

    // 1. Get old type
    const oldResult = await pool.query(
      `SELECT account_type 
       FROM account 
       WHERE account_id = $1 AND deleted = 0`,
      [changedAccountId]
    );

    if (oldResult.rows.length === 0) {
      throw new Error("Account is disabled. Please enable it first.");
    }

    const oldType = oldResult.rows[0].account_type;

    // 2. Update account type
    await pool.query(
      `UPDATE account 
       SET account_type = $1 
       WHERE account_id = $2`,
      [newType, changedAccountId]
    );

    // 3. Insert audit
     await pool.query(
      `INSERT INTO account_audit 
         (account_id, admin_account_id, old_value, new_value, date)
       VALUES ($1, $2, $3, $4, NOW())`,
      [changedAccountId, adminId, oldType, newType]
    ); 

    await pool.query("COMMIT");
    return true;

  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}


/* ************************************
 * Toggle account logical deletion state
 ************************************ */
async function toggleAccountDeleted(accountId, newState, adminId) {
  try {
    // 1. Get old state
    let oldState;
    let newStateDescription;
    let oldStateDescription;
    if (newState == 0 ) {
      oldState = 1;
      oldStateDescription = "Disabled";
      newStateDescription = "Enabled";
    } else {
      oldState = 0;
      oldStateDescription = "Enabled";
      newStateDescription = "Disabled";
    }

    // 2. Update account
    const result = await pool.query(
      `
      UPDATE account
      SET deleted = $1
      WHERE account_id = $2
      RETURNING account_id
      `,
      [newState, accountId]
    );

    // 3. Insert audit
    await pool.query(
      `INSERT INTO account_audit 
         (account_id, admin_account_id, old_value, new_value, date)
       VALUES ($1, $2, $3, $4, NOW())`,
      [accountId, adminId, oldStateDescription, newStateDescription]
    ); 

    if (result.rows.length === 0) {
      throw new Error("Account not found.");
    }

    return true;

  } catch (error) {
    console.error("Model error (toggleAccountDeleted):", error);
    throw error;
  }
}

/* *****************************
* Return Audit records
* ***************************** */
async function getRecentAuditRecords () {
  try {
    const result = await pool.query(
      `SELECT a.id, b.account_email AS account, a.old_value, a.new_Value, c.account_email as user, a.date FROM public.account_audit a
      INNER JOIN public.account b ON a.account_id = b.account_id
      INNER JOIN public.account c ON a.admin_account_id = c.account_id
      ORDER BY 1 DESC LIMIT 100`)
    return result.rows
  } catch (error) {
    throw new Error("No audit records found.")
  }
}


module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword, getAllAccounts, updateAccountType, toggleAccountDeleted, getRecentAuditRecords };