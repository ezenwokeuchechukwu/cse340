// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

/* =======================
   GET Routes
========================== */

// Management view
router.get("/", 
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildManagementView)
);

// Get inventory JSON data by classification
router.get("/getInventory/:classification_id", 
  utilities.handleErrors(invController.getInventoryJSON)
);

// Inventory by classification view
router.get("/type/:classificationId", 
  utilities.handleErrors(invController.buildByClassificationId)
);

// Vehicle detail page
router.get("/detail/:inv_id", 
  utilities.handleErrors(invController.buildByInvId)
);

// Trigger intentional server error
router.get("/trigger-error", 
  utilities.handleErrors(invController.triggerError)
);

// Add classification view
router.get("/add-classification", 
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildAddClassification)
);

// Edit inventory view
router.get("/edit/:inv_id", 
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.editInventoryView)
);

// Add inventory view
router.get("/add-inventory", 
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildAddInventory)
);

// Deletion confirmation view
router.get("/delete/:inv_id", 
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.deleteView)
);

/* =======================
   POST Routes
========================== */

// Delete inventory item
router.post("/delete", 
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.deleteItem)
);

// Add classification process
router.post("/add-classification",
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  invValidate.classificationRules(),
  invValidate.checkData,
  utilities.handleErrors(invController.addClassification)
);

// Add inventory process
router.post("/add-inventory",
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  invValidate.inventoryRules(),
  invValidate.checkData,
  utilities.handleErrors(invController.addInventory)
);

// Update inventory process
router.post("/update",
  utilities.checkLogin,
  utilities.checkAdminEmployee,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Export router
module.exports = router;
