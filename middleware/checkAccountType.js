module.exports = function (req, res, next) {
  const account = res.locals.accountData
  if (!account || (account.account_type !== "Employee" && account.account_type !== "Admin")) {
    req.flash("notice", "You do not have access to this section.")
    return res.redirect("/account/")
  }
  next()
}
