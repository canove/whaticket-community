import { Router } from "express";
import * as WebHooksController from "../controllers/WebHookMetaController";
const WebHookMetaRoutes = Router();

WebHookMetaRoutes.get("/", WebHooksController.index);
WebHookMetaRoutes.post("/", WebHooksController.webHook);
export default WebHookMetaRoutes;
