import express from "express";
import * as WhatsAppController from "../controllers/WhatsAppController";

const HealthRoutes = express.Router();

HealthRoutes.get(
  "/",
  WhatsAppController.health
);
HealthRoutes.post(
  "/",
  WhatsAppController.health
);


export default HealthRoutes;
