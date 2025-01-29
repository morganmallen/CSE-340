// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const classValidate = require("../utilities/classification-validation");
const invValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory detail view
router.get("/detail/:invId", invController.buildByInventoryId);

router.get("/", utilities.handleErrors(invController.buildManagement));

// Route to build add classification view
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

// Route to build add inventory view
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);

// Route to trigger intentional 500 error
router.get("/error", (req, res, next) => {
  if (!invController.triggerError) {
    next(new Error("Controller function not found"));
    return;
  }
  utilities.handleErrors(invController.triggerError)(req, res, next);
});

router.post(
  "/add-classification",
  classValidate.classificationRules(),
  classValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
);

router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;
