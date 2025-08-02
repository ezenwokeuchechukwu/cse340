const jwt = require("jsonwebtoken")
require("dotenv").config()

const checkJWT = (req, res, next) => {
  const token = req.cookies.jwt

  if (!token) {
    res.locals.loggedin = false
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    res.locals.loggedin = true
    res.locals.accountData = decoded
    req.accountData = decoded // Optional: can be used in routes/controllers
    next()
  } catch (err) {
    console.error("JWT verification failed:", err)
    res.clearCookie("jwt")
    res.locals.loggedin = false
    return next()
  }
}

module.exports = checkJWT
