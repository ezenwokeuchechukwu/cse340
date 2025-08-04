/******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 ******************************************/

/* ***********************
 * Require Statements
 *************************/
require("dotenv").config(); // Load environment variables
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./database/");
const staticRoutes = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const cartRoute = require("./routes/cartRoute");
const utilities = require("./utilities");
const checkJWT = require("./middleware/checkJWT")


const app = express();

/* ***********************
 * Middleware
 *************************/
// Favicon handler
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Static files
app.use(express.static("public"));

// Body and cookie parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkJWT) 

// Session configuration
app.use(
  session({
    store: new pgSession({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// JWT middleware
app.use(utilities.checkJWTToken);

// Cart count middleware
app.use(utilities.setCartCount);

/* ***********************
 * View Engine and Layout
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes);
app.use("/inv", utilities.handleErrors(inventoryRoute));
app.use("/account", utilities.handleErrors(accountRoute));
app.use("/cart", utilities.handleErrors(cartRoute));

// Home route
app.get("/", utilities.handleErrors(baseController.buildHome));

/* ***********************
 * 404 Error Handler
 *************************/
app.use(
  utilities.handleErrors(async (req, res, next) => {
    next({
      status: 404,
      message:
        "Sorry, we appear to have lost that page. I guess we broke the steering wheel on that link. Let's <a href='/'>go home</a>.",
    });
  })
);

/* ***********************
 * Global Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at "${req.originalUrl}": ${err.message}`);
  const message =
    err.status === 404
      ? err.message
      : "OOPS!! We broke the steering wheel on that request. Let's <a href='/'>go home</a>.";
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`App listening at http://${host}:${port}`);
});
