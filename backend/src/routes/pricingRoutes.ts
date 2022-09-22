import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as PricingController from "../controllers/PricingController";

const pricingRoutes = Router();

pricingRoutes.get("/pricing", isAuth, PricingController.index);

pricingRoutes.post("/pricing", isAuth, PricingController.store);

pricingRoutes.get("/pricing/:pricingId", isAuth, PricingController.show);

pricingRoutes.put("/pricing/:pricingId", isAuth, PricingController.update);

pricingRoutes.delete("/pricing/:pricingId", isAuth, PricingController.remove);

export default pricingRoutes;
