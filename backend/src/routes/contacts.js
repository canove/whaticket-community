const express = require("express");
const isAuth = require("../middleware/is-auth");

const ContactController = require("../controllers/ContactController");

const routes = express.Router();

routes.get("/contacts", isAuth, ContactController.index);
// routes.post(ContactController.postCreateContact);

routes.post("/contacts", isAuth, ContactController.store);

module.exports = routes;
