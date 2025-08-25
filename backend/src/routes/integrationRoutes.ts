import { Router } from "express";
import isAuth from "../middleware/isAuth";
import IntegrationController from "../controllers/IntegrationController";

const integrationRoutes = Router();

// Webhook management
integrationRoutes.get("/webhooks", isAuth, IntegrationController.listWebhooks);
integrationRoutes.post("/webhooks", isAuth, IntegrationController.createWebhook);
integrationRoutes.put("/webhooks/:id", isAuth, IntegrationController.updateWebhook);
integrationRoutes.delete("/webhooks/:id", isAuth, IntegrationController.deleteWebhook);
integrationRoutes.post("/webhooks/:id/test", isAuth, IntegrationController.testWebhook);
integrationRoutes.get("/webhooks/:id/stats", isAuth, IntegrationController.getWebhookStats);
integrationRoutes.get("/webhooks/events", isAuth, IntegrationController.getAvailableEvents);

// Payment integrations
integrationRoutes.get("/payments", isAuth, IntegrationController.listPayments);
integrationRoutes.post("/payments/asaas", isAuth, IntegrationController.createAsaasPayment);
integrationRoutes.get("/payments/:id", isAuth, IntegrationController.getPaymentStatus);
integrationRoutes.post("/payments/:id/sync", isAuth, IntegrationController.syncPayment);
integrationRoutes.post("/payments/link", isAuth, IntegrationController.generatePaymentLink);

// Webhook endpoints (no auth required for external providers)
integrationRoutes.post("/webhooks/asaas", IntegrationController.handleAsaasWebhook);

// Configuration management
integrationRoutes.get("/config", isAuth, IntegrationController.getIntegrationConfig);
integrationRoutes.put("/config", isAuth, IntegrationController.updateIntegrationConfig);

export default integrationRoutes;