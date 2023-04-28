import { Router } from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import isAuth from "../middleware/isAuth";

import * as ScheduleController from "../controllers/ScheduleController";

const scheduleRoutes = Router();

const upload = multer(uploadConfig);

scheduleRoutes.get("/schedules", isAuth, ScheduleController.index);

scheduleRoutes.post(
  "/schedule",
  isAuth,
  upload.array("medias"),
  ScheduleController.store
);

scheduleRoutes.delete(
  "/schedule/:scheduleId",
  isAuth,
  ScheduleController.remove
);

export default scheduleRoutes;
