const express = require("express");
const isAuth = require("../middleware/is-auth");

const MessangeController = require("../controllers/message");

const routes = express.Router();

routes.get(
	"/messages/:contactId",
	isAuth,
	MessangeController.getContactMessages
);
routes.post(
	"/messages/:contactId",
	isAuth,
	MessangeController.postCreateContactMessage
);

module.exports = routes;
