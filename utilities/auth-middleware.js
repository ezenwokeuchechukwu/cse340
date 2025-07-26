const jwt = require("jsonwebtoken");

function checkEmployeeOrAdmin(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      res.locals.accountData = decoded;
      return next();
    } else {
      req.flash("notice", "Access denied.");
      return res.redirect("/account/login");
    }
  } catch (error) {
    req.flash("notice", "Invalid session. Please log in.");
    return res.redirect("/account/login");
  }
}

module.exports = { checkEmployeeOrAdmin };
