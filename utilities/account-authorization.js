const jwt = require("jsonwebtoken")
require("dotenv").config()

/* **************************************
* Middleware to check token and admin/employee authorization
* ************************************* */
const checkAdminEmployee = async (req, res, next) => {
  console.log("Middleware hit!")
  
  if (!req.cookies.jwt) {
    console.log("No JWT in cookies")
    return res.redirect("/account/login?error=Please log in to access this feature")
  }

  try {
    const decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET)
    console.log("Decoded JWT:", decoded)
    
    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      console.log("Access granted!")
      return next()
    } else {
      console.log("Wrong account type")
      return res.redirect("/account/login?error=Unauthorized access. Employee or Admin access required.")
    }
  } catch (error) {
    console.log("Error:", error)
    return res.redirect("/account/login?error=Authentication failed. Please log in again.")
  }
}

module.exports = { checkAdminEmployee }