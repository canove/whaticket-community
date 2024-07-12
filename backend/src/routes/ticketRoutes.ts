import express from "express";
import isAuth from "../middleware/isAuth";

import * as TicketController from "../controllers/TicketController";

const ticketRoutes = express.Router();

ticketRoutes.get("/tickets", isAuth, TicketController.index);

ticketRoutes.get("/tickets/:ticketId", isAuth, TicketController.show);

ticketRoutes.get(
  "/showParticipants/:ticketId",
  isAuth,
  TicketController.ShowParticipants
);

ticketRoutes.get(
  "/showAllRelatedTickets/:ticketId",
  isAuth,
  TicketController.showAllRelatedTickets
);

ticketRoutes.post("/tickets", isAuth, TicketController.store);

ticketRoutes.post("/ticketLog", isAuth, TicketController.createTicketLog);

ticketRoutes.post(
  "/tickets/recoverAllMessages/:ticketId",
  isAuth,
  TicketController.recoverAllMessages
);

ticketRoutes.put("/tickets/:ticketId", isAuth, TicketController.update);

ticketRoutes.delete("/tickets/:ticketId", isAuth, TicketController.remove);

export default ticketRoutes;
