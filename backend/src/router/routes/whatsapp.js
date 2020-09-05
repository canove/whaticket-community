const express = require("express");
const isAuth = require("../../middleware/is-auth");

const WhatsAppSessionController = require("../../controllers/WhatsAppSessionController");

const routes = express.Router();

routes.get("/whatsapp/session/", isAuth, WhatsAppSessionController.index);

routes.post("/whatsapp/session", isAuth, WhatsAppSessionController.store);

routes.get(
	"/whatsapp/session/:sessionId",
	isAuth,
	WhatsAppSessionController.show
);

routes.put(
	"/whatsapp/session/:sessionId",
	isAuth,
	WhatsAppSessionController.update
);

routes.delete(
	"/whatsapp/session/:sessionId",
	isAuth,
	WhatsAppSessionController.delete
);

module.exports = routes;
