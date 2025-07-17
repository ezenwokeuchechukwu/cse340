const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");

// Route to build classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build vehicle detail view
router.get(
  "/detail/:invId", // ✅ This must match the one used in the controller and view link
  utilities.handleErrors(invController.buildVehicleDetail)
);

// Intentional error route
router.get(
  "/error-trigger",
  utilities.handleErrors(invController.throwError)
);

module.exports = router;
