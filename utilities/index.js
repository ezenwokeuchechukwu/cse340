const invModel = require("../models/inventory-model");
const cartModel = require("../models/cart-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Util = {};

/* ****************************************
 * Build Main Navigation
 **************************************** */
Util.getNav = async function () {
	try {
		const data = await invModel.getClassifications();
		let list = "<ul>";
		list += '<li><a href="/" title="Home page">Home</a></li>';
		data.rows.forEach((row) => {
			list += `
				<li>
					<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">
						${row.classification_name}
					</a>
				</li>`;
		});
		list += "</ul>";
		return list;
	} catch (err) {
		console.error("Error building navigation:", err);
		return "<ul><li><a href='/'>Home</a></li></ul>";
	}
};

/* ****************************************
 * Build Classification Grid
 **************************************** */
Util.buildClassificationGrid = async function (data, showCartButton = false) {
	let grid = "";

	if (data.length > 0) {
		grid = '<ul class="inv-display">';
		data.forEach((vehicle) => {
			grid += `
				<li class="grid-item">
					<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
						<img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" class="vehicle-thumbnail" />
					</a>
					<div class="namePrice">
						<hr />
						<h2>
							<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
								${vehicle.inv_make} ${vehicle.inv_model}
							</a>
						</h2>
						<span>${Util.formatPrice(vehicle.inv_price)}</span>
					</div>`;

			if (showCartButton) {
				grid += `
					<form action="/cart/add" method="POST">
						<input type="hidden" name="inv_id" value="${vehicle.inv_id}" />
						<button type="submit" class="form-button">Add to Cart</button>
					</form>`;
			}

			grid += `</li>`;
		});
		grid += "</ul>";
	} else {
		grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
	}

	return grid;
};

/* ****************************************
 * Build Vehicle Detail View
 **************************************** */
Util.buildVehicleDetail = function (vehicle) {
	return `
		<div id="vehicle-detail">
			<figure class="vehicle-image">
				<img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />
			</figure>
			<div class="vehicle-info">
				<h2 class="vehicle-title">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
				<p class="vehicle-price"><strong>Price:</strong> ${Util.formatPrice(vehicle.inv_price)}</p>
				<p class="vehicle-mileage"><strong>Mileage:</strong> ${Number(vehicle.inv_miles).toLocaleString()} miles</p>
				<p class="vehicle-description"><strong>Description:</strong> ${vehicle.inv_description}</p>
				<p class="vehicle-color"><strong>Color:</strong> ${vehicle.inv_color}</p>
				<form action="/cart/add" method="POST">
					<input type="hidden" name="inv_id" value="${vehicle.inv_id}" />
					<button type="submit" class="form-button">Add to Cart</button>
				</form>
			</div>
		</div>
	`;
};

/* ****************************************
 * Build Classification Dropdown List
 **************************************** */
Util.buildClassificationList = async function (selected = null) {
	try {
		const data = await invModel.getClassifications();
		let classificationList = '<select name="classification_id" id="classificationList" required>';
		classificationList += "<option value=''>Choose a Classification</option>";

		data.rows.forEach((classification) => {
			classificationList += `
				<option value="${classification.classification_id}" ${
					selected == classification.classification_id ? "selected" : ""
				}>
					${classification.classification_name}
				</option>`;
		});

		classificationList += "</select>";
		return classificationList;
	} catch (err) {
		console.error("Error building classification list:", err);
		return "<select><option>Error loading classifications</option></select>";
	}
};

/* ****************************************
 * Format Price Utility
 **************************************** */
Util.formatPrice = function (amount) {
	return "$" + Number(amount).toLocaleString("en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});
};

/* ****************************************
 * Error Handling Wrapper
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
	Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * JWT Middleware
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
	res.locals.loggedin = 0;
	res.locals.accountData = null;

	if (req.cookies.jwt) {
		jwt.verify(
			req.cookies.jwt,
			process.env.ACCESS_TOKEN_SECRET,
			(err, accountData) => {
				if (err) {
					res.clearCookie("jwt");
				} else {
					res.locals.loggedin = 1;
					res.locals.accountData = accountData;
				}
				next();
			}
		);
	} else {
		next();
	}
};

/* ****************************************
 * Set Cart Count Middleware
 **************************************** */
Util.setCartCount = async (req, res, next) => {
	if (res.locals.loggedin && res.locals.accountData?.account_type === "Client") {
		try {
			const count = await cartModel.getCartCount(res.locals.accountData.account_id);
			res.locals.cartCount = count || 0;
		} catch (err) {
			console.error("Error setting cart count:", err);
			res.locals.cartCount = 0;
		}
	} else {
		res.locals.cartCount = 0;
	}
	next();
};

/* ****************************************
 * Login Requirement Middleware
 **************************************** */
Util.checkLogin = (req, res, next) => {
	if (res.locals.loggedin) {
		return next();
	}
	req.flash("notice", "Please log in.");
	return res.redirect("/account/login");
};

/* ****************************************
 * Admin/Employee Access Middleware
 **************************************** */
Util.checkAdminEmployee = (req, res, next) => {
	const account_type = res.locals.accountData?.account_type;
	if (res.locals.loggedin && (account_type === "Admin" || account_type === "Employee")) {
		return next();
	}
	req.flash("notice", "Please log in with employee credentials.");
	return res.redirect("/account/login");
};

module.exports = Util;
