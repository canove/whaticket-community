const express = require("express");
const isAuth = require("../middleware/is-auth");

const WhatsappController = require("../controllers/whatsapp");

const routes = express.Router();

routes.get("/whatsapp/session", isAuth, WhatsappController.getSession);

routes.get("/whatsapp/contacts", isAuth, WhatsappController.getContacts); // fetch contacts in user cellphone, not in use

module.exports = routes;
