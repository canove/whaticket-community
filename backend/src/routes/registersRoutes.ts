import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as RegistersController from "../controllers/RegistersController";

const registersRoutes = Router();

registersRoutes.get("/registers/list", isAuth, RegistersController.index);

registersRoutes.get("/registers/listReport", isAuth, RegistersController.list);

registersRoutes.get(
  "/registers/exportPdf",
  isAuth,
  RegistersController.exportPdf
);

registersRoutes.get(
  "/registers/exportCsv",
  isAuth,
  RegistersController.exportCsv
);

export default registersRoutes;
