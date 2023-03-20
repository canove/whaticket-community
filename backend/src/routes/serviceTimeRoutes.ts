import express from "express";
import isAuth from "../middleware/isAuth";

import * as ServiceTimeController from "../controllers/ServiceTimeController";

const serviceTimeRoutes = express.Router();

serviceTimeRoutes.get(
  "/serviceTime/queue",
  isAuth,
  ServiceTimeController.queue
);

export default serviceTimeRoutes;
