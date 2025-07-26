/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const cookieParser = require("cookie-parser");
const session = require("express-session");
const pool = require("./database/");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities");
const accountRoute = require("./routes/accountRoute");
const cartRoute = require("./routes/cartRoute");
const bodyParser = require("body-parser");

/* ***********************
 * Middleware
 *************************/
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this line for form data

app.use(
	session({
		store: new (require("connect-pg-simple")(session))({
			createTableIfMissing: true,
			pool,
		}),
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: true,
		name: "sessionId",
	})
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
	res.locals.messages = require("express-messages")(req, res);
	next();
});

app.use(cookieParser());

app.use(utilities.checkJWTToken);
// Add this line after checkJWTToken middleware
app.use(utilities.setCartCount);

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use(static);
app.use("/inv", utilities.handleErrors(inventoryRoute));
app.use("/account", utilities.handleErrors(accountRoute));
app.use("/cart", utilities.handleErrors(cartRoute));

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));

// File Not Found Route - must be last route in list
app.use(
	utilities.handleErrors(async (req, res, next) => {
		next({
			status: 404,
			message:
				"Sorry, we appear to have lost that page. I guess we broke the steering Wheel on that link, we'll just have to carpool <a href='/'>home</a>",
		});
	})
);

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
	let nav = await utilities.getNav();
	console.error(`Error at: "${req.originalUrl}": ${err.message}`);
	if (err.status == 404) {
		message = err.message;
	} else {
		message =
			"OOPS!! We broke the steering Wheel on that request, guess we'll just have to carpool <a href='/'>home</a>";
	}
	res.render("errors/error", {
		title: err.status || "Server Error",
		message,
		nav,
	});
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
	console.log(`app listening on ${host}:${port}`);
});