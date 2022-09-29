import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as BillingsController from "../controllers/BillingsController";

const billingsRoutes = Router();

billingsRoutes.get("/billings/", isAuth, BillingsController.index);

export default billingsRoutes;
