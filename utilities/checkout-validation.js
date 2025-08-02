const { body, validationResult } = require("express-validator");
const utilities = require(".");

const validate = {};

validate.checkoutRules = () => {
	return [
		body("shipping_address")
			.trim()
			.notEmpty()
			.withMessage("Shipping address is required.")
			.isLength({ min: 3, max: 100 })
			.withMessage("Address must be between 3 and 100 characters."),

		body("shipping_city")
			.trim()
			.notEmpty()
			.withMessage("City is required.")
			.isLength({ min: 2, max: 50 })
			.withMessage("City must be between 2 and 50 characters."),

		body("shipping_state")
			.trim()
			.notEmpty()
			.withMessage("State/Province is required.")
			.isLength({ min: 2, max: 50 })
			.withMessage("State/Province must be between 2 and 50 characters."),

		body("shipping_zip")
			.trim()
			.notEmpty()
			.withMessage("Postal/ZIP code is required.")
			.isLength({ min: 2, max: 10 })
			.withMessage("Please provide a valid postal/ZIP code.")
			.matches(/^[A-Za-z0-9\s-]*$/)
			.withMessage("Postal/ZIP code contains invalid characters."),

		body("shipping_phone")
			.trim()
			.notEmpty()
			.withMessage("Phone number is required.")
			.matches(/^[+\d\s-()]*$/)
			.withMessage("Please enter a valid phone number.")
			.isLength({ min: 5, max: 20 })
			.withMessage("Phone number must be between 5 and 20 characters."),
	];
};

validate.checkCheckoutData = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		let nav = await utilities.getNav();
		const cartItems = req.body.cartItems || [];
		errors.array().forEach(error => {
			req.flash("notice", error.msg);
		});
		res.render("cart/checkout", {
			title: "Checkout",
			nav,
			shipping_address: req.body.shipping_address,
			shipping_city: req.body.shipping_city,
			shipping_state: req.body.shipping_state,
			shipping_country: req.body.shipping_country,
			shipping_zip: req.body.shipping_zip,
			shipping_phone: req.body.shipping_phone,
			cartItems: cartItems,
			total: req.body.total || "0.00",
		});
		return;
	}
	next();
};

module.exports = validate;
