import express from "express";
import isAuth from "../middleware/isAuth";

import * as WorkTimeController from "../controllers/WorkTimeController";

const workTimeRoutes = express.Router();

workTimeRoutes.get(
  "/workTime/",
  isAuth,
  WorkTimeController.index
);

workTimeRoutes.post(
  "/workTime/",
  isAuth,
  WorkTimeController.store
);

export default workTimeRoutes;
