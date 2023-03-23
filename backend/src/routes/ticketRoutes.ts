import express from "express";
import isAuth from "../middleware/isAuth";

import * as TicketController from "../controllers/TicketController";

const ticketRoutes = express.Router();

ticketRoutes.get("/tickets", isAuth, TicketController.index);

ticketRoutes.get("/tickets/list", isAuth, TicketController.list);

ticketRoutes.get("/tickets/time", isAuth, TicketController.average);

ticketRoutes.get("/tickets/:ticketId", isAuth, TicketController.show);

ticketRoutes.post("/tickets", isAuth, TicketController.store);

ticketRoutes.put("/tickets/:ticketId", isAuth, TicketController.update);

ticketRoutes.delete("/tickets/:ticketId", isAuth, TicketController.remove);

ticketRoutes.get("/tickets/hist/:contactId", isAuth, TicketController.historic);

ticketRoutes.get("/tickets/:categoryId", isAuth, TicketController.resolve);


export default ticketRoutes;
