// controllers/invController.js
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const invController = {};

/* ***************************
 * Build inventory by classification view
 * Route: /inv/type/:classificationId
 *************************** */
invController.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = utilities.buildClassificationGrid(data.rows); // ✅ FIXED
    const nav = await utilities.getNav();
    const className = data.rows[0]?.classification_name || "Vehicles";

    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Build individual vehicle detail view
 * Route: /inv/detail/:invId
 *************************** */
invController.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.invId);
    const data = await invModel.getVehicleById(inv_id);
    const vehicle = data.rows ? data.rows[0] : null;

    if (!vehicle) {
      const nav = await utilities.getNav();
      return res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "Sorry, that vehicle does not exist.",
        nav
      });
    }

    // Format price and miles
    vehicle.inv_price_formatted = vehicle.inv_price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
    vehicle.inv_miles_formatted = vehicle.inv_miles.toLocaleString("en-US");

    const nav = await utilities.getNav();

    res.render("./inventory/detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Throw intentional server error (for /inv/error-trigger)
 *************************** */
invController.throwError = async function (req, res, next) {
  next(new Error("Intentional Server Error for testing"));
};

module.exports = invController;
