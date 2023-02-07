import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as OperationsController from "../controllers/OperationsController";

const operationsRoutes = Router();

operationsRoutes.get("/operations/", isAuth, OperationsController.index);

export default operationsRoutes;
