const express = require("express");
const router = express.Router();
const favController = require("../controllers/favoritesController");
const utilities = require("../utilities");

router.get("/", utilities.checkLogin, favController.showFavorites);
router.get("/add/:invId", utilities.checkLogin, favController.addFavorite);

module.exports = router;
