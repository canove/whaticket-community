import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as FlowsController from "../controllers/FlowsController";
import * as FlowsNodesController from "../controllers/FlowsNodesController";
import isAuthApi from "../middleware/isAuthApi";

const flowsRoutes = Router();

// Flows

flowsRoutes.get("/flows", isAuth, FlowsController.index);

flowsRoutes.post("/flows", isAuth, FlowsController.store);

flowsRoutes.get("/flows/:flowId", isAuth, FlowsController.show);

flowsRoutes.put("/flows/:flowId", isAuth, FlowsController.update);

flowsRoutes.delete("/flows/:flowId", isAuth, FlowsController.remove);

// Flows - API

flowsRoutes.post("/flows/start/:flowNodeId", isAuthApi, FlowsController.start);

// Flows Nodes

flowsRoutes.get("/flowsNodes/:flowId", isAuth, FlowsNodesController.show);

flowsRoutes.put("/flowsNodes/:flowId", isAuth, FlowsNodesController.update);

export default flowsRoutes;
