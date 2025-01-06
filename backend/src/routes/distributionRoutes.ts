import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as DistributionController from "../controllers/DistributionController";

const distributionRoutes = Router();

distributionRoutes.get("/distribution/:queueId", isAuth, DistributionController.index);

distributionRoutes.post("/distribution", isAuth, DistributionController.toggleDistribution);

distributionRoutes.post("/distribution/start", isAuth, DistributionController.startDistribution);


export default distributionRoutes;
