import { Request, Response } from "express";
import { logger } from "../utils/logger";
import WebchatService from "../services/WebchatServices/WebchatService";
import { v4 as uuidv4 } from "uuid";

class WebchatController {
  /**
   * Initialize webchat session
   */
  async initSession(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.params;
      const {
        sessionId,
        visitorInfo,
        metadata,
        widgetId,
        currentUrl,
        pageTitle
      } = req.body;

      const sessionData = {
        sessionId: sessionId || uuidv4(),
        tenantId: parseInt(tenantId),
        visitorInfo: visitorInfo || {},
        metadata: {
          ...metadata,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        widgetId,
        currentUrl,
        pageTitle
      };

      const session = await WebchatService.initializeSession(sessionData);

      return res.status(200).json({
        success: true,
        session: {
          id: session.id,
          sessionId: session.sessionId,
          isActive: session.isActive,
          contactId: session.contactId,
          ticketId: session.ticketId
        }
      });
    } catch (error) {
      logger.error("Error initializing webchat session:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to initialize webchat session"
      });
    }
  }

  /**
   * Send message from visitor
   */
  async sendMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId, sessionId } = req.params;
      const { message, visitorInfo } = req.body;

      if (!message || message.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Message cannot be empty"
        });
      }

      const result = await WebchatService.sendVisitorMessage({
        tenantId: parseInt(tenantId),
        sessionId,
        message: message.trim(),
        visitorInfo
      });

      return res.status(200).json({
        success: true,
        message: result
      });
    } catch (error) {
      logger.error("Error sending webchat message:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to send message"
      });
    }
  }

  /**
   * Send message from agent
   */
  async sendAgentMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId, sessionId } = req.params;
      const { message, userId } = req.body;

      if (!message || message.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Message cannot be empty"
        });
      }

      const result = await WebchatService.sendAgentMessage({
        tenantId: parseInt(tenantId),
        sessionId,
        message: message.trim(),
        userId: parseInt(userId)
      });

      return res.status(200).json({
        success: true,
        message: result
      });
    } catch (error) {
      logger.error("Error sending agent message:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to send agent message"
      });
    }
  }

  /**
   * Get session messages
   */
  async getMessages(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId, sessionId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const messages = await WebchatService.getSessionMessages({
        tenantId: parseInt(tenantId),
        sessionId,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      return res.status(200).json({
        success: true,
        messages
      });
    } catch (error) {
      logger.error("Error getting webchat messages:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to get messages"
      });
    }
  }

  /**
   * Update visitor info
   */
  async updateVisitorInfo(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId, sessionId } = req.params;
      const { visitorInfo } = req.body;

      const session = await WebchatService.updateVisitorInfo({
        tenantId: parseInt(tenantId),
        sessionId,
        visitorInfo
      });

      return res.status(200).json({
        success: true,
        session: {
          id: session.id,
          sessionId: session.sessionId,
          visitorInfo: session.visitorInfo
        }
      });
    } catch (error) {
      logger.error("Error updating visitor info:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update visitor info"
      });
    }
  }

  /**
   * Update session activity
   */
  async updateActivity(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId, sessionId } = req.params;
      const { currentUrl, pageTitle } = req.body;

      await WebchatService.updateSessionActivity({
        tenantId: parseInt(tenantId),
        sessionId,
        currentUrl,
        pageTitle
      });

      return res.status(200).json({
        success: true
      });
    } catch (error) {
      logger.error("Error updating session activity:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update activity"
      });
    }
  }

  /**
   * End webchat session
   */
  async endSession(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId, sessionId } = req.params;
      const { reason = 'visitor_ended' } = req.body;

      await WebchatService.endSession({
        tenantId: parseInt(tenantId),
        sessionId,
        reason
      });

      return res.status(200).json({
        success: true
      });
    } catch (error) {
      logger.error("Error ending webchat session:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to end session"
      });
    }
  }

  /**
   * Get active sessions for tenant
   */
  async getActiveSessions(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await WebchatService.getActiveSessions({
        tenantId: parseInt(tenantId),
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error("Error getting active sessions:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to get active sessions"
      });
    }
  }

  /**
   * Get webchat configuration for tenant
   */
  async getConfig(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.params;

      const config = await WebchatService.getWebchatConfig(parseInt(tenantId));

      return res.status(200).json({
        success: true,
        config
      });
    } catch (error) {
      logger.error("Error getting webchat config:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to get config"
      });
    }
  }

  /**
   * Generate webchat widget script
   */
  async getWidgetScript(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.params;
      const { widgetId } = req.query;

      const script = await WebchatService.generateWidgetScript({
        tenantId: parseInt(tenantId),
        widgetId: widgetId as string
      });

      // Set proper content type for JavaScript
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

      return res.status(200).send(script);
    } catch (error) {
      logger.error("Error getting widget script:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to generate widget script"
      });
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.params;
      const { startDate, endDate } = req.query;

      const stats = await WebchatService.getSessionStats({
        tenantId: parseInt(tenantId),
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      return res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      logger.error("Error getting session stats:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to get session stats"
      });
    }
  }
}

export default new WebchatController();