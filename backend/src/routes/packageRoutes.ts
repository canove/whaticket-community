import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as PackageController from "../controllers/PackageController";

const packageRoutes = Router();

packageRoutes.get("/packages", isAuth, PackageController.index);

packageRoutes.post("/packages", isAuth, PackageController.store);

packageRoutes.get("/packages/:packageId", isAuth, PackageController.show);

packageRoutes.put("/packages/:packageId", isAuth, PackageController.update);

packageRoutes.delete("/packages/:packageId", isAuth, PackageController.remove);

export default packageRoutes;
