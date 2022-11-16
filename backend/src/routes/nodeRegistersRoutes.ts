import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as NodeRegistersController from "../controllers/NodeRegistersController";

const historicRoutes = Router();

historicRoutes.get("/nodeRegisters/", isAuth, NodeRegistersController.index);

export default historicRoutes;
