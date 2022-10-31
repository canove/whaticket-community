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
