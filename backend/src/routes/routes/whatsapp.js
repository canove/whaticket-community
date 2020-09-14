const express = require("express");
const isAuth = require("../../middleware/is-auth");

const WhatsAppController = require("../../controllers/WhatsAppController");

const routes = express.Router();

routes.get("/whatsapp/", isAuth, WhatsAppController.index);

routes.post("/whatsapp/", isAuth, WhatsAppController.store);

routes.get("/whatsapp/:whatsappId", isAuth, WhatsAppController.show);

routes.put("/whatsapp/:whatsappId", isAuth, WhatsAppController.update);

routes.delete("/whatsapp/:whatsappId", isAuth, WhatsAppController.delete);

module.exports = routes;
