// Needed Resources
const express = require("express");
const router = new express.Router();

const messageController = require("../controllers/messageController");
const messageValidation = require("../utilities/message-validation");
const utilities = require("../utilities");

router.use(["/view/:messageId", "/compose", "/compose/:messageId", "/send", "/archive", "/view/:messageId/delete", "/delete", "/view/:messageId/toggle-read", "/view/:messageId/toggle-archived"], utilities.checkLogin);

router.get("/", utilities.checkLogin, utilities.handleErrors(messageController.buildInbox));

// Route to build message view view
router.get("/view/:messageId", utilities.handleErrors(messageController.buildMessageView));

// Route to build compose messages view
router.get("/compose", utilities.handleErrors(messageController.buildCompose));
router.get("/compose/:messageId", utilities.handleErrors(messageController.buildCompose));
router.post("/send", messageValidation.sendMessageRules(), messageValidation.checkMessageData, utilities.handleErrors(messageController.sendMessage))

// Rout to build archived messages view
router.get("/archive", utilities.handleErrors(messageController.buildArchive));

// Route to build delete message confirmation view
router.get("/view/:messageId/delete", utilities.handleErrors(messageController.buildDelete));
router.post("/delete", utilities.handleErrors(messageController.deleteMessage));


//API calls
router.get("/view/:messageId/toggle-read", utilities.handleErrors(messageController.toggleRead));
router.get("/view/:messageId/toggle-archived", utilities.handleErrors(messageController.toggleArchived));

module.exports = router;