const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ============================
 * Build inventory by classification
 ============================= */
invCont.buildByClassificationId = async (req, res, next) => {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data, true); // Always show cart button
    const nav = await utilities.getNav();
    const className = data[0]?.classification_name || "Vehicles";

    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildByClassificationId:", error);
    next(error);
  }
};

/* ============================
 * Build vehicle detail page
 ============================= */
invCont.buildByInvId = async (req, res, next) => {
  try {
    const inv_id = req.params.inv_id;
    const vehicle = await invModel.getInventoryById(inv_id);
    const detail = utilities.buildVehicleDetail(vehicle);
    const nav = await utilities.getNav();
    const title = `${vehicle.inv_make} ${vehicle.inv_model}`;

    res.render("./inventory/detail", {
      title,
      nav,
      detail,
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildByInvId:", error);
    next(error);
  }
};

/* ============================
 * Trigger 500 error for testing
 ============================= */
invCont.triggerError = (req, res, next) => {
  throw new Error("Intentional 500 error triggered");
};

/* ============================
 * Build management view
 ============================= */
invCont.buildManagementView = async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      className: "Management",
      classificationList,
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildManagementView:", error);
    next(error);
  }
};

/* ============================
 * Add classification view
 ============================= */
invCont.buildAddClassification = async (req, res) => {
  const nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

/* ============================
 * Add inventory view
 ============================= */
invCont.buildAddInventory = async (req, res) => {
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null,
  });
};

/* ============================
 * Process add classification
 ============================= */
invCont.addClassification = async (req, res) => {
  const { classification_name } = req.body;
  const result = await invModel.addClassification(classification_name);

  if (result) {
    req.flash("notice", `Classification "${classification_name}" added successfully.`);
    res.redirect("/inv");
  } else {
    req.flash("error", "Adding classification failed.");
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav: await utilities.getNav(),
      errors: null,
    });
  }
};

/* ============================
 * Process add inventory
 ============================= */
invCont.addInventory = async (req, res) => {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;

    const result = await invModel.addInventory({
      classification_id: parseInt(classification_id),
      inv_make,
      inv_model,
      inv_year: parseInt(inv_year),
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price: parseFloat(inv_price),
      inv_miles: parseInt(inv_miles),
      inv_color,
    });

    if (result?.rowCount > 0) {
      req.flash("notice", `Vehicle "${inv_make} ${inv_model}" added successfully.`);
      res.redirect("/inv");
    } else {
      throw new Error("Addition failed");
    }
  } catch (error) {
    console.error("Error in addInventory:", error);
    req.flash("error", "There was an error adding the vehicle.");
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(req.body.classification_id),
      errors: null,
      ...req.body,
    });
  }
};

/* ============================
 * Get inventory JSON
 ============================= */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id);
    const invData = await invModel.getInventoryByClassificationId(classification_id);

    if (invData?.length) {
      res.json(invData);
    } else {
      throw new Error("No data found for this classification.");
    }
  } catch (error) {
    console.error("Error in getInventoryJSON:", error);
    next(error);
  }
};

/* ============================
 * Build edit view
 ============================= */
invCont.editInventoryView = async (req, res) => {
  const inv_id = parseInt(req.params.inv_id);
  const itemData = await invModel.getInventoryById(inv_id);
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
  const nav = await utilities.getNav();
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("./inventory/edit-inventory", {
    title: `Edit ${itemName}`,
    nav,
    classificationSelect,
    errors: null,
    ...itemData,
  });
};

/* ============================
 * Update inventory item
 ============================= */
invCont.updateInventory = async (req, res) => {
  try {
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    const result = await invModel.updateInventory(
      parseInt(inv_id),
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      parseFloat(inv_price),
      parseInt(inv_year),
      parseInt(inv_miles),
      inv_color,
      parseInt(classification_id)
    );

    if (result) {
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("notice", `The ${itemName} was successfully updated.`);
      res.redirect("/inv/");
    } else {
      throw new Error("Update failed");
    }
  } catch (error) {
    console.error("Error in updateInventory:", error);
    req.flash("notice", "Sorry, the update failed.");
    res.status(500).render("inventory/edit-inventory", {
      title: `Edit ${req.body.inv_make} ${req.body.inv_model}`,
      nav: await utilities.getNav(),
      classificationSelect: await utilities.buildClassificationList(req.body.classification_id),
      errors: null,
      ...req.body,
    });
  }
};

/* ============================
 * Build delete confirmation view
 ============================= */
invCont.deleteView = async (req, res) => {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      req.flash("notice", "That vehicle does not exist.");
      return res.redirect("/inv/");
    }

    const nav = await utilities.getNav();
    res.render("./inventory/delete-confirm", {
      title: `Delete ${itemData.inv_make} ${itemData.inv_model}`,
      nav,
      errors: null,
      ...itemData,
    });
  } catch (error) {
    console.error("Error in deleteView:", error);
    req.flash("notice", "Error displaying delete confirmation.");
    res.redirect("/inv/");
  }
};

/* ============================
 * Delete inventory item
 ============================= */
invCont.deleteItem = async (req, res) => {
  try {
    const inv_id = parseInt(req.body.inv_id);
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      req.flash("notice", "That vehicle does not exist.");
      return res.redirect("/inv/");
    }

    const result = await invModel.deleteInventoryItem(inv_id);

    if (result?.rowCount > 0) {
      req.flash("notice", `${itemData.inv_make} ${itemData.inv_model} was deleted.`);
    } else {
      req.flash("notice", "Delete operation failed.");
    }

    res.redirect("/inv/");
  } catch (error) {
    console.error("Error in deleteItem:", error);
    req.flash("notice", "Error deleting vehicle.");
    res.redirect("/inv/");
  }
};

module.exports = invCont;
