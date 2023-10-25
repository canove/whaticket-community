import express from "express";
import isAuth from "../middleware/isAuth";

import * as AnnouncementController from "../controllers/AnnouncementController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const routes = express.Router();

routes.get("/announcements/list", isAuth, AnnouncementController.findList);

routes.get("/announcements", isAuth, AnnouncementController.index);

routes.get("/announcements/:id", isAuth, AnnouncementController.show);

routes.post("/announcements", isAuth, AnnouncementController.store);

routes.put("/announcements/:id", isAuth, AnnouncementController.update);

routes.delete("/announcements/:id", isAuth, AnnouncementController.remove);

routes.post(
  "/announcements/:id/media-upload",
  isAuth,
  upload.array("file"),
  AnnouncementController.mediaUpload
);

routes.delete(
  "/announcements/:id/media-upload",
  isAuth,
  AnnouncementController.deleteMedia
);

export default routes;
