import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as RegistersController from "../controllers/RegistersController";

const registersRoutes = Router();

registersRoutes.get("/registers/list", isAuth, RegistersController.index);

export default registersRoutes;
