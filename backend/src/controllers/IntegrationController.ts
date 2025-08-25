import { Request, Response } from "express";
import { logger } from "../utils/logger";
import Webhook from "../models/Webhook";
import PaymentIntegration from "../models/PaymentIntegration";
import WebhookService from "../services/WebhookServices/WebhookService";
import AsaasService from "../services/IntegrationServices/AsaasService";
import Contact from "../models/Contact";

class IntegrationController {
  /**
   * Get all webhooks for tenant
   */
  async listWebhooks(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { page = 1, limit = 20 } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const { count, rows } = await Webhook.findAndCountAll({
        where: { tenantId },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as string),
        offset
      });

      return res.status(200).json({
        success: true,
        webhooks: rows,
        pagination: {
          total: count,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(count / parseInt(limit as string))
        }
      });
    } catch (error) {
      logger.error("Error listing webhooks:", error);
      return res.status(500).json({
        error: "Failed to list webhooks"
      });
    }
  }

  /**
   * Create new webhook
   */
  async createWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const {
        name,
        url,
        events,
        secret,
        headers,
        timeout = 30000,
        retryConfig
      } = req.body;

      if (!name || !url || !events || events.length === 0) {
        return res.status(400).json({
          error: "Name, URL and events are required"
        });
      }

      const webhook = await Webhook.create({
        name,
        url,
        events,
        secret,
        headers: headers || {},
        timeout,
        retryConfig: retryConfig || {
          maxRetries: 3,
          retryDelays: [1000, 2000, 4000],
          exponentialBackoff: true
        },
        tenantId
      });

      logger.info(`Webhook created: ${webhook.id} for tenant ${tenantId}`);

      return res.status(201).json({
        success: true,
        webhook
      });
    } catch (error) {
      logger.error("Error creating webhook:", error);
      return res.status(500).json({
        error: "Failed to create webhook"
      });
    }
  }

  /**
   * Update webhook
   */
  async updateWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;
      const updates = req.body;

      const webhook = await Webhook.findOne({
        where: { id, tenantId }
      });

      if (!webhook) {
        return res.status(404).json({
          error: "Webhook not found"
        });
      }

      await webhook.update(updates);

      return res.status(200).json({
        success: true,
        webhook
      });
    } catch (error) {
      logger.error("Error updating webhook:", error);
      return res.status(500).json({
        error: "Failed to update webhook"
      });
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;

      const webhook = await Webhook.findOne({
        where: { id, tenantId }
      });

      if (!webhook) {
        return res.status(404).json({
          error: "Webhook not found"
        });
      }

      await webhook.destroy();

      logger.info(`Webhook deleted: ${id}`);

      return res.status(200).json({
        success: true,
        message: "Webhook deleted successfully"
      });
    } catch (error) {
      logger.error("Error deleting webhook:", error);
      return res.status(500).json({
        error: "Failed to delete webhook"
      });
    }
  }

  /**
   * Test webhook
   */
  async testWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;

      const webhook = await Webhook.findOne({
        where: { id, tenantId }
      });

      if (!webhook) {
        return res.status(404).json({
          error: "Webhook not found"
        });
      }

      const result = await WebhookService.testWebhook(webhook.id);

      return res.status(200).json({
        success: true,
        result
      });
    } catch (error) {
      logger.error("Error testing webhook:", error);
      return res.status(500).json({
        error: "Failed to test webhook"
      });
    }
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;

      const webhook = await Webhook.findOne({
        where: { id, tenantId }
      });

      if (!webhook) {
        return res.status(404).json({
          error: "Webhook not found"
        });
      }

      const stats = await WebhookService.getWebhookStats(webhook.id);

      return res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      logger.error("Error getting webhook stats:", error);
      return res.status(500).json({
        error: "Failed to get webhook stats"
      });
    }
  }

  /**
   * Get available webhook events
   */
  async getAvailableEvents(req: Request, res: Response): Promise<Response> {
    try {
      const events = WebhookService.getAvailableEvents();

      return res.status(200).json({
        success: true,
        events
      });
    } catch (error) {
      logger.error("Error getting available events:", error);
      return res.status(500).json({
        error: "Failed to get available events"
      });
    }
  }

  /**
   * Create Asaas payment
   */
  async createAsaasPayment(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const {
        contactId,
        amount,
        description,
        dueDate,
        billingType = 'PIX',
        installments
      } = req.body;

      if (!contactId || !amount || !description) {
        return res.status(400).json({
          error: "Contact ID, amount and description are required"
        });
      }

      const contact = await Contact.findOne({
        where: { id: contactId, tenantId }
      });

      if (!contact) {
        return res.status(404).json({
          error: "Contact not found"
        });
      }

      // Get Asaas configuration (this would come from tenant settings)
      const asaasConfig = {
        apiKey: process.env.ASAAS_API_KEY || 'your-asaas-api-key',
        sandbox: process.env.NODE_ENV !== 'production'
      };

      const asaasService = new AsaasService(asaasConfig);

      const payment = await asaasService.createCharge({
        contact,
        amount: parseFloat(amount),
        description,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        billingType,
        installments: installments ? parseInt(installments) : undefined
      });

      return res.status(201).json({
        success: true,
        payment
      });
    } catch (error) {
      logger.error("Error creating Asaas payment:", error);
      return res.status(500).json({
        error: "Failed to create payment"
      });
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;

      const payment = await PaymentIntegration.findOne({
        where: { id, tenantId },
        include: [Contact]
      });

      if (!payment) {
        return res.status(404).json({
          error: "Payment not found"
        });
      }

      return res.status(200).json({
        success: true,
        payment
      });
    } catch (error) {
      logger.error("Error getting payment status:", error);
      return res.status(500).json({
        error: "Failed to get payment status"
      });
    }
  }

  /**
   * Generate payment link
   */
  async generatePaymentLink(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const {
        contactId,
        amount,
        description,
        successUrl,
        externalReference
      } = req.body;

      if (!contactId || !amount || !description) {
        return res.status(400).json({
          error: "Contact ID, amount and description are required"
        });
      }

      const contact = await Contact.findOne({
        where: { id: contactId, tenantId }
      });

      if (!contact) {
        return res.status(404).json({
          error: "Contact not found"
        });
      }

      // Get Asaas configuration
      const asaasConfig = {
        apiKey: process.env.ASAAS_API_KEY || 'your-asaas-api-key',
        sandbox: process.env.NODE_ENV !== 'production'
      };

      const asaasService = new AsaasService(asaasConfig);

      const paymentUrl = await asaasService.generatePaymentLink({
        contact,
        amount: parseFloat(amount),
        description,
        successUrl,
        externalReference
      });

      return res.status(200).json({
        success: true,
        paymentUrl
      });
    } catch (error) {
      logger.error("Error generating payment link:", error);
      return res.status(500).json({
        error: "Failed to generate payment link"
      });
    }
  }

  /**
   * Handle Asaas webhook
   */
  async handleAsaasWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const payload = req.body;

      // Get Asaas configuration
      const asaasConfig = {
        apiKey: process.env.ASAAS_API_KEY || 'your-asaas-api-key',
        sandbox: process.env.NODE_ENV !== 'production'
      };

      const asaasService = new AsaasService(asaasConfig);
      await asaasService.handleWebhook(payload);

      return res.status(200).json({
        success: true,
        message: "Webhook processed successfully"
      });
    } catch (error) {
      logger.error("Error handling Asaas webhook:", error);
      return res.status(500).json({
        error: "Failed to process webhook"
      });
    }
  }

  /**
   * Get integration configuration
   */
  async getIntegrationConfig(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;

      // This would normally come from tenant settings table
      const config = {
        asaas: {
          enabled: !!process.env.ASAAS_API_KEY,
          sandbox: process.env.NODE_ENV !== 'production',
          configured: !!process.env.ASAAS_API_KEY
        },
        paghiper: {
          enabled: false,
          configured: false
        },
        webhooks: {
          enabled: true,
          availableEvents: WebhookService.getAvailableEvents()
        },
        facebookPixel: {
          enabled: !!process.env.FACEBOOK_PIXEL_ID,
          pixelId: process.env.FACEBOOK_PIXEL_ID,
          configured: !!process.env.FACEBOOK_PIXEL_ID
        }
      };

      return res.status(200).json({
        success: true,
        config
      });
    } catch (error) {
      logger.error("Error getting integration config:", error);
      return res.status(500).json({
        error: "Failed to get integration config"
      });
    }
  }

  /**
   * Update integration configuration
   */
  async updateIntegrationConfig(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { integration, config } = req.body;

      if (!integration || !config) {
        return res.status(400).json({
          error: "Integration and config are required"
        });
      }

      // Here you would normally update tenant settings
      // For now, we'll just return success
      logger.info(`Integration config updated for tenant ${tenantId}: ${integration}`, config);

      return res.status(200).json({
        success: true,
        message: "Integration configuration updated successfully"
      });
    } catch (error) {
      logger.error("Error updating integration config:", error);
      return res.status(500).json({
        error: "Failed to update integration config"
      });
    }
  }

  /**
   * List payments for tenant
   */
  async listPayments(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { 
        page = 1, 
        limit = 20, 
        status,
        provider 
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const whereClause: any = { tenantId };

      if (status) {
        whereClause.status = status;
      }

      if (provider) {
        whereClause.provider = provider;
      }

      const { count, rows } = await PaymentIntegration.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Contact,
            attributes: ['id', 'name', 'number']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as string),
        offset
      });

      return res.status(200).json({
        success: true,
        payments: rows,
        pagination: {
          total: count,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(count / parseInt(limit as string))
        }
      });
    } catch (error) {
      logger.error("Error listing payments:", error);
      return res.status(500).json({
        error: "Failed to list payments"
      });
    }
  }

  /**
   * Sync payment status with provider
   */
  async syncPayment(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;

      const payment = await PaymentIntegration.findOne({
        where: { id, tenantId }
      });

      if (!payment) {
        return res.status(404).json({
          error: "Payment not found"
        });
      }

      if (payment.provider === 'asaas') {
        const asaasConfig = {
          apiKey: process.env.ASAAS_API_KEY || 'your-asaas-api-key',
          sandbox: process.env.NODE_ENV !== 'production'
        };

        const asaasService = new AsaasService(asaasConfig);
        const updatedPayment = await asaasService.syncPaymentStatus(payment.id);

        return res.status(200).json({
          success: true,
          payment: updatedPayment
        });
      }

      return res.status(400).json({
        error: "Sync not supported for this provider"
      });
    } catch (error) {
      logger.error("Error syncing payment:", error);
      return res.status(500).json({
        error: "Failed to sync payment"
      });
    }
  }
}

export default new IntegrationController();