const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
	const classification_id = req.params.classificationId;
	const data = await invModel.getInventoryByClassificationId(classification_id);
	// Always show the Add to Cart button regardless of login status.
	const showCartButton = true;
	const grid = await utilities.buildClassificationGrid(data, showCartButton);
	let nav = await utilities.getNav();
	const className = data[0] ? data[0].classification_name : "Vehicles";
	res.render("./inventory/classification", {
		title: className + " vehicles",
		nav,
		grid,
		errors: null,
	});
};

invCont.buildByInvId = async function (req, res, next) {
	const inv_id = req.params.inv_id;
	const vehicle = await invModel.getInventoryById(inv_id);
	const detail = utilities.buildVehicleDetail(vehicle);
	const nav = await utilities.getNav();
	const vehicleTitle = vehicle.inv_make + " " + vehicle.inv_model;
	res.render("./inventory/detail", {
		title: vehicleTitle,
		nav,
		detail,
		errors: null,
	});
};

/* ****************************************
 * Trigger intentional 500 error
 * *************************************** */
invCont.triggerError = async function (req, res, next) {
	throw new Error("Intentional 500 error triggered");
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
	try {
		const nav = await utilities.getNav();
		const classificationList = await utilities.buildClassificationList();
		const className = "Management";
		res.render("./inventory/management", {
			title: "Vehicle Management",
			nav,
			className,
			classificationList,
			errors: null,
		});
	} catch (error) {
		error.status = 500;
		console.error("Error in buildManagementView:", error);
		next(error);
	}
};

invCont.buildAddClassification = async function (req, res, next) {
	const nav = await utilities.getNav();
	res.render("./inventory/add-classification", {
		title: "Add New Classification",
		nav,
		errors: null,
	});
};

invCont.buildAddInventory = async function (req, res, next) {
	const nav = await utilities.getNav();
	const classificationList = await utilities.buildClassificationList();
	res.render("./inventory/add-inventory", {
		title: "Add New Vehicle",
		nav,
		classificationList,
		errors: null,
	});
};

invCont.addClassification = async function (req, res, next) {
	const { classification_name } = req.body;
	const result = await invModel.addClassification(classification_name);

	if (result) {
		req.flash(
			"notice",
			`Classification ${classification_name} added successfully.`
		);
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

invCont.addInventory = async function (req, res, next) {
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

		if (result.rowCount > 0) {
			req.flash(
				"notice",
				`Vehicle ${inv_make} ${inv_model} added successfully.`
			);
			res.redirect("/inv");
		} else {
			req.flash("error", "Sorry, the addition failed.");
			res.render("inventory/add-inventory", {
				title: "Add New Vehicle",
				nav: await utilities.getNav(),
				classificationList: await utilities.buildClassificationList(
					classification_id
				),
				errors: null,
				...req.body,
			});
		}
	} catch (error) {
		console.error("addInventory error:", error);
		req.flash("error", "Sorry, there was an error processing the request.");
		res.render("inventory/add-inventory", {
			title: "Add New Vehicle",
			nav: await utilities.getNav(),
			classificationList: await utilities.buildClassificationList(
				req.body.classification_id
			),
			errors: null,
			...req.body,
		});
	}
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
	try {
		const classification_id = parseInt(req.params.classification_id);
		console.log("Getting inventory for classification:", classification_id);
		const invData = await invModel.getInventoryByClassificationId(
			classification_id
		);
		console.log("Retrieved inventory data:", invData);
		if (invData && invData.length > 0) {
			return res.json(invData);
		} else {
			next(new Error("No data returned"));
		}
	} catch (error) {
		console.error("Error in getInventoryJSON:", error);
		next(error);
	}
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
	const inv_id = parseInt(req.params.inv_id);
	let nav = await utilities.getNav();
	const itemData = await invModel.getInventoryById(inv_id);
	const classificationSelect = await utilities.buildClassificationList(
		itemData.classification_id
	);
	const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
	res.render("./inventory/edit-inventory", {
		title: "Edit " + itemName,
		nav,
		classificationSelect: classificationSelect,
		errors: null,
		inv_id: itemData.inv_id,
		inv_make: itemData.inv_make,
		inv_model: itemData.inv_model,
		inv_year: itemData.inv_year,
		inv_description: itemData.inv_description,
		inv_image: itemData.inv_image,
		inv_thumbnail: itemData.inv_thumbnail,
		inv_price: itemData.inv_price,
		inv_miles: itemData.inv_miles,
		inv_color: itemData.inv_color,
		classification_id: itemData.classification_id,
	});
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
	try {
		let nav = await utilities.getNav();
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

		console.log("Update data received:", req.body);

		const updateResult = await invModel.updateInventory(
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

		if (updateResult) {
			const itemName = updateResult.inv_make + " " + updateResult.inv_model;
			req.flash("notice", `The ${itemName} was successfully updated.`);
			res.redirect("/inv/");
		} else {
			throw new Error("Update failed to return data");
		}
	} catch (error) {
		console.error("Error in updateInventory:", error);
		const { inv_id, inv_make, inv_model, classification_id, ...rest } =
			req.body;
		req.flash("notice", "Sorry, the update failed.");
		res.status(500).render("inventory/edit-inventory", {
			title: "Edit " + inv_make + " " + inv_model,
			nav: await utilities.getNav(),
			classificationSelect: await utilities.buildClassificationList(
				classification_id
			),
			errors: null,
			inv_id,
			inv_make,
			inv_model,
			classification_id,
			...rest,
		});
	}
};

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.deleteView = async function (req, res, next) {
	try {
		const inv_id = parseInt(req.params.inv_id);
		const nav = await utilities.getNav();
		const itemData = await invModel.getInventoryById(inv_id);

		if (!itemData) {
			req.flash("notice", "That vehicle does not exist.");
			res.redirect("/inv/");
			return;
		}

		const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
		res.render("./inventory/delete-confirm", {
			title: "Delete " + itemName,
			nav,
			errors: null,
			inv_id: itemData.inv_id,
			inv_make: itemData.inv_make,
			inv_model: itemData.inv_model,
			inv_year: itemData.inv_year,
			inv_price: itemData.inv_price,
		});
	} catch (error) {
		console.error("Error in deleteView:", error);
		req.flash("notice", "Sorry, there was an error processing the request.");
		res.redirect("/inv/");
	}
};

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteItem = async function (req, res, next) {
	try {
		const inv_id = parseInt(req.body.inv_id);
		const itemData = await invModel.getInventoryById(inv_id);

		if (!itemData) {
			req.flash("notice", "That vehicle does not exist.");
			res.redirect("/inv/");
			return;
		}

		const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
		const deleteResult = await invModel.deleteInventoryItem(inv_id);

		if (deleteResult.rowCount > 0) {
			req.flash("notice", `The ${itemName} was successfully deleted.`);
			res.redirect("/inv/");
		} else {
			req.flash("notice", "Sorry, the delete failed.");
			res.redirect("/inv/");
		}
	} catch (error) {
		console.error("Error in deleteItem:", error);
		req.flash("notice", "Sorry, there was an error processing the deletion.");
		res.redirect("/inv/");
	}
};

module.exports = invCont;
