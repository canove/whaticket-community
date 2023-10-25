import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as QueueOptionController from "../controllers/QueueOptionController";

const queueOptionRoutes = Router();

queueOptionRoutes.get("/queue-options", isAuth, QueueOptionController.index);

queueOptionRoutes.post("/queue-options", isAuth, QueueOptionController.store);

queueOptionRoutes.get("/queue-options/:queueOptionId", isAuth, QueueOptionController.show);

queueOptionRoutes.put("/queue-options/:queueOptionId", isAuth, QueueOptionController.update);

queueOptionRoutes.delete("/queue-options/:queueOptionId", isAuth, QueueOptionController.remove);

export default queueOptionRoutes;
