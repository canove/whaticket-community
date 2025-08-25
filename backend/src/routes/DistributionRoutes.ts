import express from "express";
import isAuth from "../middleware/isAuth";

import * as DistributionController from "../controllers/DistributionController";

const DistributionRoutes = express.Router();

DistributionRoutes.get("/distributions", DistributionController.index);
DistributionRoutes.get("/distributions/:queueId", DistributionController.index);
DistributionRoutes.put("/distributions/:queueId", DistributionController.createOrUpdate);

export default DistributionRoutes;
