const express = require("express");
const isAuth = require("../middleware/is-auth");

const WhatsAppSessionController = require("../controllers/WhatsAppSessionController");

const routes = express.Router();

routes.get(
	"/whatsapp/session/:sessionId",
	isAuth,
	WhatsAppSessionController.show
);

// fetch contacts in user cellphone, not in use
// routes.get("/whatsapp/contacts", isAuth, WhatsappController.getContacts);

module.exports = routes;
