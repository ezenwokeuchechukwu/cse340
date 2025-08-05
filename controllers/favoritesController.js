const favModel = require("../models/favoritesModel");

/* Add favorite */
async function addFavorite(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;
    const inv_id = req.params.invId;
    await favModel.addFavorite(account_id, inv_id);
    req.flash("notice", "Vehicle added to favorites.");
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    next(error);
  }
}

/* View favorites */
async function showFavorites(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;
    const favorites = await favModel.getFavoritesByAccount(account_id);
    res.render("account/favorites", {
      title: "My Favorites",
      favorites,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { addFavorite, showFavorites };
