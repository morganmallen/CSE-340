// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory detail view
router.get("/detail/:invId", invController.buildByInventoryId);

// Route to trigger intentional 500 error
router.get("/error", (req, res, next) => {
  if (!invController.triggerError) {
    next(new Error("Controller function not found"))
    return
  }
  utilities.handleErrors(invController.triggerError)(req, res, next)
})

module.exports = router;