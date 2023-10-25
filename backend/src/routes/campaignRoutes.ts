import express from "express";
import isAuth from "../middleware/isAuth";

import * as CampaignController from "../controllers/CampaignController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const routes = express.Router();

routes.get("/campaigns/list", isAuth, CampaignController.findList);

routes.get("/campaigns", isAuth, CampaignController.index);

routes.get("/campaigns/:id", isAuth, CampaignController.show);

routes.post("/campaigns", isAuth, CampaignController.store);

routes.put("/campaigns/:id", isAuth, CampaignController.update);

routes.delete("/campaigns/:id", isAuth, CampaignController.remove);

routes.post("/campaigns/:id/cancel", isAuth, CampaignController.cancel);

routes.post("/campaigns/:id/restart", isAuth, CampaignController.restart);

routes.post(
  "/campaigns/:id/media-upload",
  isAuth,
  upload.array("file"),
  CampaignController.mediaUpload
);

routes.delete(
  "/campaigns/:id/media-upload",
  isAuth,
  CampaignController.deleteMedia
);

export default routes;
