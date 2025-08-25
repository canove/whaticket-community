import { Router } from "express";
import isAuth from "../middleware/isAuth";
import tenantContext from "../middleware/tenantContext";
import * as FlowController from "../controllers/FlowController";

const flowRoutes = Router();

// Aplicar middleware de tenant em todas as rotas
flowRoutes.use(isAuth);
flowRoutes.use(tenantContext);

// Rotas principais de fluxos
flowRoutes.get("/flows", FlowController.index);
flowRoutes.post("/flows", FlowController.store);
flowRoutes.get("/flows/:flowId", FlowController.show);
flowRoutes.put("/flows/:flowId", FlowController.update);
flowRoutes.delete("/flows/:flowId", FlowController.destroy);

// Rotas de controle de fluxos
flowRoutes.patch("/flows/:flowId/toggle", FlowController.toggleActive);
flowRoutes.post("/flows/:flowId/duplicate", FlowController.duplicate);
flowRoutes.post("/flows/:flowId/test", FlowController.test);

// Rotas de execuções
flowRoutes.get("/flows/:flowId/executions", FlowController.executions);

export default flowRoutes;
