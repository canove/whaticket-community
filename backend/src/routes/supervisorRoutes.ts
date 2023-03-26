import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as SupervisorController from "../controllers/SupervisorController";

const supervisorRoutes = Router();

supervisorRoutes.get("/supervisor", isAuth, SupervisorController.index);

export default supervisorRoutes;
