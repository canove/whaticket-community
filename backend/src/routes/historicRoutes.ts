import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as HistoricController from "../controllers/HistoricController";

const historicRoutes = Router();

historicRoutes.get("/historics/", isAuth, HistoricController.show);

export default historicRoutes;
