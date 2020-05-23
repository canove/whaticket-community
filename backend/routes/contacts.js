const express = require("express");
const isAuth = require("../middleware/is-auth");

const ContactController = require("../controllers/contact");

const routes = express.Router();

routes.get("/contacts", isAuth, ContactController.getContacts);
// routes.post(ContactController.postCreateContact);

module.exports = routes;
