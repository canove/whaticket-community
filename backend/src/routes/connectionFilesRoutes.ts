import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as ConnectionFilesController from "../controllers/ConnectionFilesController";

const connectionFilesRoutes = Router();

connectionFilesRoutes.get(
  "/connectionFiles/",
  isAuth,
  ConnectionFilesController.index
);

connectionFilesRoutes.get(
  "/connectionFiles/:connectionFileId",
  isAuth,
  ConnectionFilesController.show
);

connectionFilesRoutes.post(
  "/connectionFiles/",
  isAuth,
  ConnectionFilesController.store
);

connectionFilesRoutes.post(
  "/connectionFiles/bind/",
  isAuth,
  ConnectionFilesController.bind
);

connectionFilesRoutes.post(
  "/connectionFiles/bind-queue/",
  isAuth,
  ConnectionFilesController.bindQueue
);

connectionFilesRoutes.put(
  "/connectionFiles/:connectionFileId",
  isAuth,
  ConnectionFilesController.update
);

connectionFilesRoutes.delete(
  "/connectionFiles/:connectionFileId",
  isAuth,
  ConnectionFilesController.remove
);

export default connectionFilesRoutes;
