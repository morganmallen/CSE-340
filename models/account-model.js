const pool = require("../database/");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    return error.message;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

/* ****************************************
 * Get Account by ID
 * **************************************** */
async function getAccountById(accountId) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email FROM account WHERE account_id = $1",
      [accountId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error getting account by ID:", error);
    return null;
  }
}

/* ****************************************
 * Update Account Information
 * **************************************** */
async function updateAccountInfo(accountId, firstName, lastName, email) {
  try {
    const result = await pool.query(
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4",
      [firstName, lastName, email, accountId]
    );
    return result;
  } catch (error) {
    console.error("Error updating account information:", error);
    throw error;
  }
}

/* ****************************************
 * Update Account Password
 * **************************************** */
async function updatePassword(accountId, hashedPassword) {
  try {
    const result = await pool.query(
      "UPDATE account SET account_password = $1 WHERE account_id = $2",
      [hashedPassword, accountId]
    );
    return result;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
}

module.exports = { 
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById, 
  updateAccountInfo, 
  updatePassword 
};