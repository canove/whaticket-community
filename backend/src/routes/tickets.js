const express = require("express");
const isAuth = require("../middleware/is-auth");

const TicketController = require("../controllers/TicketController");

const routes = express.Router();

routes.get("/tickets", isAuth, TicketController.index);

routes.post("/tickets", isAuth, TicketController.store);

routes.put("/tickets/:ticketId", isAuth, TicketController.update);

module.exports = routes;
