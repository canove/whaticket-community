import express from "express";
import isAuth from "../middleware/isAuth";

import * as BatchController from "../controllers/BatchController";

const batchRoutes = express.Router();

batchRoutes.get(
  "/batch/",
  isAuth,
  BatchController.index
);

batchRoutes.put(
  "/batch/:batchId",
  isAuth,
  BatchController.update
);

export default batchRoutes;
