import express from "express";
import isAuth from "../middleware/isAuth";

import * as ServiceTimeController from "../controllers/ServiceTimeController";

const serviceTimeRoutes = express.Router();

serviceTimeRoutes.get(
  "/serviceTime/",
  isAuth,
  ServiceTimeController.index
);

serviceTimeRoutes.get(
  "/serviceTime/exportPDF",
  isAuth,
  ServiceTimeController.exportPDF
);

serviceTimeRoutes.get(
  "/serviceTime/exportCSV",
  isAuth,
  ServiceTimeController.exportCSV
);

export default serviceTimeRoutes;
