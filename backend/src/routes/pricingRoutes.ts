import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as PricingController from "../controllers/PricingController";

const pricingRoutes = Router();

pricingRoutes.get("/pricings", isAuth, PricingController.index);

pricingRoutes.post("/pricings", isAuth, PricingController.store);

pricingRoutes.get("/pricings/:pricingId", isAuth, PricingController.show);

pricingRoutes.put("/pricings/:pricingId", isAuth, PricingController.update);

pricingRoutes.delete("/pricings/:pricingId", isAuth, PricingController.remove);

export default pricingRoutes;
