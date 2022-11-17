import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as NodeRegistersController from "../controllers/NodeRegistersController";

const nodeRegistersRoutes = Router();

nodeRegistersRoutes.get(
  "/nodeRegisters/",
  isAuth,
  NodeRegistersController.index
);

nodeRegistersRoutes.get(
  "/nodeRegisters/exportCsv",
  isAuth,
  NodeRegistersController.exportCsv
);

export default nodeRegistersRoutes;
