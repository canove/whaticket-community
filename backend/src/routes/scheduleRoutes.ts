import { Router } from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import isAuth from "../middleware/isAuth";

import * as ScheduleController from "../controllers/ScheduleController";

const scheduleRoutes = Router();

const upload = multer(uploadConfig);

scheduleRoutes.get("/schedules/:ticketId", isAuth, ScheduleController.index);

scheduleRoutes.post(
  "/schedule/:ticketId",
  isAuth,
  upload.array("medias"),
  ScheduleController.store
);

scheduleRoutes.delete(
  "/schedule/:messageId",
  isAuth,
  ScheduleController.remove
);

export default scheduleRoutes;
