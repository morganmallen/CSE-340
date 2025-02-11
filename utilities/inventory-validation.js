const { body, validationResult } = require("express-validator");
const utilities = require(".");

const inventoryValidate = {};

/* ******************************
 * Inventory Data Validation Rules 
 * ***************************** */
inventoryValidate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please select a classification"),

    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .matches(/^[A-Za-z0-9 ]+$/)
      .withMessage("Make can only contain letters, numbers, and spaces"),

    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .matches(/^[A-Za-z0-9 ]+$/)
      .withMessage("Model can only contain letters, numbers, and spaces"),

    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),

    body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a description"),

    body("inv_image")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide an image path"),

    body("inv_thumbnail")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a thumbnail path"),

    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),

    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number"),

    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .matches(/^[A-Za-z ]+$/)
      .withMessage("Color can only contain letters and spaces"),
  ];
};

/* ******************************
 * Check Inventory Data and return errors or continue to registration
 * ***************************** */
inventoryValidate.checkInventoryData = async (req, res, next) => {
  const { 
    inv_make, 
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id 
  } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);
    res.render("inventory/add-inventory", {
      errors,
      title: "Add New Vehicle",
      nav,
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
    return;
  }
  next();
};

/* ******************************
 * Check Updated Inventory Data and return errors or continue to update
 * ***************************** */
inventoryValidate.checkUpdateData = async (req, res, next) => {
  const { 
    inv_id, // Added inventory ID
    inv_make, 
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id 
  } = req.body;
  
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);

    res.render("inventory/edit-inventory", { // Changed to edit-inventory
      errors,
      title: `Edit ${inv_make} ${inv_model}`, // Changed title to match controller
      nav,
      classificationList,
      inv_id, // Ensure the inv_id is passed back
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
    return;
  }
  next();
};


module.exports = inventoryValidate;