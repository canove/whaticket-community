import { Router } from "express";
import isAuth from "../middleware/isAuth";
import { store, show, execute } from "../controllers/FlowController";

const flowRoutes = Router();

flowRoutes.post("/flows", isAuth, store);
flowRoutes.get("/flows/:flowId", isAuth, show);
flowRoutes.post("/flows/:flowId/execute", isAuth, execute);

export default flowRoutes;
