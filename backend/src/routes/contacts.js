const express = require("express");
const isAuth = require("../middleware/is-auth");

const ContactController = require("../controllers/ContactController");

const routes = express.Router();

routes.get("/contacts", isAuth, ContactController.index);

routes.get("/contacts/:contactId", isAuth, ContactController.show);

routes.post("/contacts", isAuth, ContactController.store);

routes.put("/contacts/:contactId", isAuth, ContactController.update);

routes.delete("/contacts/:contactId", isAuth, ContactController.delete);

module.exports = routes;
