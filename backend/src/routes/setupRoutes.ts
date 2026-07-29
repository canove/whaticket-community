import { Router } from "express";

import * as SetupController from "../controllers/SetupController";

// Public routes — the install wizard runs before any user/token exists.
// Security is enforced in the service (only works while there are zero users).
const setupRoutes = Router();

setupRoutes.get("/setup/status", SetupController.status);
setupRoutes.post("/setup", SetupController.store);

export default setupRoutes;
