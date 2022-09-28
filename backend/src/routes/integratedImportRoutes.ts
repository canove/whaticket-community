import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as IntegratedImportController from "../controllers/IntegratedImportController";

const integratedImportRoutes = Router();

integratedImportRoutes.get("/integratedImport", isAuth, IntegratedImportController.index);

integratedImportRoutes.post("/integratedImport", isAuth, IntegratedImportController.store);

integratedImportRoutes.get("/integratedImport/:integratedImportId", isAuth, IntegratedImportController.show);

integratedImportRoutes.put("/integratedImport/:integratedImportId", isAuth, IntegratedImportController.update);

integratedImportRoutes.delete("/integratedImport/:integratedImportId", isAuth, IntegratedImportController.remove);

export default integratedImportRoutes;