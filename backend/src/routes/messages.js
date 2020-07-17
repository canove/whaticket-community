const express = require("express");
const isAuth = require("../middleware/is-auth");

const MessageController = require("../controllers/MessageController");

const routes = express.Router();

routes.get("/messages/:ticketId", isAuth, MessageController.index);

routes.post("/messages/:ticketId", isAuth, MessageController.store);

module.exports = routes;
