const invModel = require("../models/inventory-model")
const utilities = require("../utilities")
const baseController = {}

/* Home page controller */
baseController.buildHome = async function(req, res) {
  const nav = await utilities.getNav()
  res.render("index", {
    title: "Home",
    nav
  })
}

/* Vehicle Detail View */
baseController.buildDetailView = async function(req, res, next) {
  try {
    const invId = parseInt(req.params.inv_id)
    const vehicleData = await invModel.getVehicleById(invId)

    if (!vehicleData) {
      return next(new Error("Vehicle not found"))
    }

    const nav = await utilities.getNav()
    const htmlContent = utilities.buildVehicleDetail(vehicleData)

    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      content: htmlContent
    })
  } catch (error) {
    next(error)
  }
}

module.exports = baseController
