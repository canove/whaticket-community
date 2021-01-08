import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as QueueController from "../controllers/QueueController";

const queueRoutes = Router();

queueRoutes.get("/queue", isAuth, QueueController.index);

queueRoutes.post("/queue", isAuth, QueueController.store);

export default queueRoutes;
