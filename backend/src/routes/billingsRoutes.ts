import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as BillingsController from "../controllers/BillingsController";

const billingsRoutes = Router();

billingsRoutes.get("/billings/", isAuth, BillingsController.index);

billingsRoutes.get("/billings/:billingId", isAuth, BillingsController.show);

billingsRoutes.get(
  "/billingControls/:billingId",
  isAuth,
  BillingsController.historic
);

export default billingsRoutes;
