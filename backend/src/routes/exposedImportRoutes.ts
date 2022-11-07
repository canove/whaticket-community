import { Router } from "express";

import isAuth from "../middleware/isAuth";
import isAuthApi from "../middleware/isAuthApi";
import * as ExposedImportController from "../controllers/ExposedImportController";

const exposedImportRoutes = Router();

exposedImportRoutes.get(
  "/exposedImports/",
  isAuth,
  ExposedImportController.index
);

exposedImportRoutes.post(
  "/exposedImports/",
  isAuth,
  ExposedImportController.store
);

exposedImportRoutes.get(
  "/exposedImports/:exposedImportId",
  isAuth,
  ExposedImportController.show
);

exposedImportRoutes.put(
  "/exposedImports/:exposedImportId",
  isAuth,
  ExposedImportController.update
);

exposedImportRoutes.delete(
  "/exposedImports/:exposedImportId",
  isAuth,
  ExposedImportController.remove
);

exposedImportRoutes.post(
  "/exposedImports/:exposedImportId",
  isAuthApi,
  ExposedImportController.start
);

export default exposedImportRoutes;
