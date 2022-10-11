import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as FlowsController from "../controllers/FlowsController";

const flowsRoutes = Router();

flowsRoutes.get("/flows", isAuth, FlowsController.index);

flowsRoutes.post("/flows", isAuth, FlowsController.store);

flowsRoutes.get(
  "/flows/connection/:connectionName",
  isAuth,
  FlowsController.connection
);

flowsRoutes.get("/flows/:flowId", isAuth, FlowsController.show);

flowsRoutes.put("/flows/:flowId", isAuth, FlowsController.update);

flowsRoutes.delete("/flows/:flowId", isAuth, FlowsController.remove);

export default flowsRoutes;
