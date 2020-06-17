const express = require("express");
const isAuth = require("../middleware/is-auth");

const WhatsappController = require("../controllers/whatsapp");

const routes = express.Router();

routes.get("/whatsapp/session", isAuth, WhatsappController.getSession);
// routes.post(
// 	"/messages/:contactId",
// 	isAuth,
// 	WhatsappController.postCreateContactMessage
// );

module.exports = routes;
