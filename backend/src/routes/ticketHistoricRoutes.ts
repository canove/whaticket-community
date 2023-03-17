import express from "express";
import isAuth from "../middleware/isAuth";

import * as TicketHistoricController from "../controllers/TicketHistoricController";

const ticketHistoricRoutes = express.Router();

ticketHistoricRoutes.get(
  "/ticketHistorics/",
  isAuth,
  TicketHistoricController.index
);

export default ticketHistoricRoutes;
