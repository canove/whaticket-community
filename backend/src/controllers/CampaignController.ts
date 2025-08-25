import { Request, Response } from "express";
import { logger } from "../utils/logger";
import Campaign, { CampaignStatus, CampaignType } from "../models/Campaign";
import CampaignExecution from "../models/CampaignExecution";
import Contact from "../models/Contact";
import CampaignQueueService from "../services/CampaignServices/CampaignQueueService";
import MessageTemplateService from "../services/CampaignServices/MessageTemplateService";
import EventEmitterService from "../services/EventServices/EventEmitterService";

class CampaignController {
  /**
   * Create a new campaign
   */
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId, id: userId } = req.user;
      const {
        name,
        description,
        type,
        messageTemplate,
        targetAudience,
        scheduledAt,
        messagesPerSecond = 1
      } = req.body;

      // Validate template
      const validation = MessageTemplateService.validateTemplate(messageTemplate);
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Invalid message template",
          details: validation.errors
        });
      }

      const campaign = await Campaign.create({
        name,
        description,
        type: type || CampaignType.INSTANT,
        status: CampaignStatus.DRAFT,
        messageTemplate,
        targetAudience,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        messagesPerSecond,
        tenantId,
        userId: parseInt(userId)
      });

      logger.info(`Campaign created: ${campaign.id} by user ${userId}`);

      return res.status(201).json({
        success: true,
        campaign
      });
    } catch (error) {
      logger.error("Error creating campaign:", error);
      return res.status(500).json({
        error: "Failed to create campaign"
      });
    }
  }

  /**
   * List campaigns for tenant
   */
  async list(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { 
        page = 1, 
        limit = 20, 
        status, 
        type,
        search 
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const whereClause: any = { tenantId };

      if (status) {
        whereClause.status = status;
      }

      if (type) {
        whereClause.type = type;
      }

      if (search) {
        whereClause[require('sequelize').Op.or] = [
          { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
          { description: { [require('sequelize').Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Campaign.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as string),
        offset,
        include: [
          {
            model: require('../models/User').default,
            attributes: ['id', 'name']
          }
        ]
      });

      return res.status(200).json({
        success: true,
        campaigns: rows,
        pagination: {
          total: count,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(count / parseInt(limit as string))
        }
      });
    } catch (error) {
      logger.error("Error listing campaigns:", error);
      return res.status(500).json({
        error: "Failed to list campaigns"
      });
    }
  }

  /**
   * Get campaign details
   */
  async show(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;

      const campaign = await Campaign.findOne({
        where: { id, tenantId },
        include: [
          {
            model: require('../models/User').default,
            attributes: ['id', 'name']
          }
        ]
      });

      if (!campaign) {
        return res.status(404).json({
          error: "Campaign not found"
        });
      }

      return res.status(200).json({
        success: true,
        campaign
      });
    } catch (error) {
      logger.error("Error getting campaign:", error);
      return res.status(500).json({
        error: "Failed to get campaign"
      });
    }
  }

  /**
   * Update campaign
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;
      const updates = req.body;

      const campaign = await Campaign.findOne({
        where: { id, tenantId }
      });

      if (!campaign) {
        return res.status(404).json({
          error: "Campaign not found"
        });
      }

      // Only allow updates if campaign is draft or paused
      if (![CampaignStatus.DRAFT, CampaignStatus.PAUSED].includes(campaign.status)) {
        return res.status(400).json({
          error: "Cannot update campaign in current status"
        });
      }

      // Validate template if provided
      if (updates.messageTemplate) {
        const validation = MessageTemplateService.validateTemplate(updates.messageTemplate);
        if (!validation.isValid) {
          return res.status(400).json({
            error: "Invalid message template",
            details: validation.errors
          });
        }
      }

      await campaign.update(updates);

      logger.info(`Campaign updated: ${campaign.id}`);

      return res.status(200).json({
        success: true,
        campaign
      });
    } catch (error) {
      logger.error("Error updating campaign:", error);
      return res.status(500).json({
        error: "Failed to update campaign"
      });
    }
  }

  /**
   * Start campaign execution
   */
  async start(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId, id: userId } = req.user;
      const { id } = req.params;

      const campaign = await Campaign.findOne({
        where: { id, tenantId }
      });

      if (!campaign) {
        return res.status(404).json({
          error: "Campaign not found"
        });
      }

      if (campaign.status !== CampaignStatus.DRAFT) {
        return res.status(400).json({
          error: "Campaign must be in draft status to start"
        });
      }

      // Get target contacts
      const contacts = await this.getTargetContacts(campaign);

      if (contacts.length === 0) {
        return res.status(400).json({
          error: "No contacts found matching target audience"
        });
      }

      // Update campaign status
      await campaign.update({
        status: CampaignStatus.RUNNING,
        startedAt: new Date(),
        statistics: {
          totalContacts: contacts.length,
          sent: 0,
          delivered: 0,
          failed: 0,
          pending: contacts.length
        }
      });

      // Add to queue
      await CampaignQueueService.addBatchCampaignJob({
        campaignId: campaign.id,
        tenantId,
        contactIds: contacts.map(c => c.id),
        messageTemplate: campaign.messageTemplate
      }, {
        rateLimit: campaign.messagesPerSecond
      });

      // Emit event
      await EventEmitterService.emitCampaignStarted({
        tenantId,
        campaignId: campaign.id,
        campaignName: campaign.name,
        totalContacts: contacts.length,
        userId: parseInt(userId)
      });

      logger.info(`Campaign started: ${campaign.id} with ${contacts.length} contacts`);

      return res.status(200).json({
        success: true,
        message: `Campaign started with ${contacts.length} contacts`,
        campaign
      });
    } catch (error) {
      logger.error("Error starting campaign:", error);
      return res.status(500).json({
        error: "Failed to start campaign"
      });
    }
  }

  /**
   * Pause campaign
   */
  async pause(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId, id: userId } = req.user;
      const { id } = req.params;
      const { reason } = req.body;

      const campaign = await Campaign.findOne({
        where: { id, tenantId }
      });

      if (!campaign) {
        return res.status(404).json({
          error: "Campaign not found"
        });
      }

      if (campaign.status !== CampaignStatus.RUNNING) {
        return res.status(400).json({
          error: "Campaign must be running to pause"
        });
      }

      await CampaignQueueService.pauseCampaign(campaign.id);

      // Emit event
      await EventEmitterService.emitCampaignPaused({
        tenantId,
        campaignId: campaign.id,
        campaignName: campaign.name,
        userId: parseInt(userId),
        reason
      });

      logger.info(`Campaign paused: ${campaign.id}`);

      return res.status(200).json({
        success: true,
        message: "Campaign paused successfully"
      });
    } catch (error) {
      logger.error("Error pausing campaign:", error);
      return res.status(500).json({
        error: "Failed to pause campaign"
      });
    }
  }

  /**
   * Resume campaign
   */
  async resume(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;

      const campaign = await Campaign.findOne({
        where: { id, tenantId }
      });

      if (!campaign) {
        return res.status(404).json({
          error: "Campaign not found"
        });
      }

      if (campaign.status !== CampaignStatus.PAUSED) {
        return res.status(400).json({
          error: "Campaign must be paused to resume"
        });
      }

      await CampaignQueueService.resumeCampaign(campaign.id);

      logger.info(`Campaign resumed: ${campaign.id}`);

      return res.status(200).json({
        success: true,
        message: "Campaign resumed successfully"
      });
    } catch (error) {
      logger.error("Error resuming campaign:", error);
      return res.status(500).json({
        error: "Failed to resume campaign"
      });
    }
  }

  /**
   * Get campaign statistics
   */
  async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;

      const campaign = await Campaign.findOne({
        where: { id, tenantId }
      });

      if (!campaign) {
        return res.status(404).json({
          error: "Campaign not found"
        });
      }

      const queueStats = await CampaignQueueService.getCampaignStats(campaign.id);

      return res.status(200).json({
        success: true,
        stats: {
          campaign: campaign.statistics,
          queue: queueStats
        }
      });
    } catch (error) {
      logger.error("Error getting campaign stats:", error);
      return res.status(500).json({
        error: "Failed to get campaign stats"
      });
    }
  }

  /**
   * Preview campaign message
   */
  async preview(req: Request, res: Response): Promise<Response> {
    try {
      const { messageTemplate, sampleData } = req.body;

      if (!messageTemplate) {
        return res.status(400).json({
          error: "Message template is required"
        });
      }

      const validation = MessageTemplateService.validateTemplate(messageTemplate);
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Invalid message template",
          details: validation.errors
        });
      }

      const preview = MessageTemplateService.previewTemplate(messageTemplate, sampleData);
      const availableVariables = MessageTemplateService.getAvailableVariables();

      return res.status(200).json({
        success: true,
        preview,
        availableVariables,
        validation
      });
    } catch (error) {
      logger.error("Error previewing campaign:", error);
      return res.status(500).json({
        error: "Failed to preview campaign"
      });
    }
  }

  /**
   * Get campaign executions
   */
  async getExecutions(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;
      const { page = 1, limit = 50, status } = req.query;

      const campaign = await Campaign.findOne({
        where: { id, tenantId }
      });

      if (!campaign) {
        return res.status(404).json({
          error: "Campaign not found"
        });
      }

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const whereClause: any = { campaignId: campaign.id };

      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await CampaignExecution.findAndCountAll({
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
        executions: rows,
        pagination: {
          total: count,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(count / parseInt(limit as string))
        }
      });
    } catch (error) {
      logger.error("Error getting campaign executions:", error);
      return res.status(500).json({
        error: "Failed to get campaign executions"
      });
    }
  }

  /**
   * Delete campaign
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;

      const campaign = await Campaign.findOne({
        where: { id, tenantId }
      });

      if (!campaign) {
        return res.status(404).json({
          error: "Campaign not found"
        });
      }

      // Only allow deletion if campaign is not running
      if (campaign.status === CampaignStatus.RUNNING) {
        return res.status(400).json({
          error: "Cannot delete running campaign. Pause it first."
        });
      }

      await campaign.destroy();

      logger.info(`Campaign deleted: ${id}`);

      return res.status(200).json({
        success: true,
        message: "Campaign deleted successfully"
      });
    } catch (error) {
      logger.error("Error deleting campaign:", error);
      return res.status(500).json({
        error: "Failed to delete campaign"
      });
    }
  }

  // Private helper methods

  private async getTargetContacts(campaign: Campaign): Promise<Contact[]> {
    try {
      const { targetAudience } = campaign;
      
      if (!targetAudience) {
        return [];
      }

      let whereClause: any = {
        tenantId: campaign.tenantId
      };

      // Handle specific contact IDs
      if (targetAudience.contactIds && targetAudience.contactIds.length > 0) {
        whereClause.id = {
          [require('sequelize').Op.in]: targetAudience.contactIds
        };
      }

      // Handle tag filters
      if (targetAudience.tags && targetAudience.tags.length > 0) {
        // This would require a tags system implementation
        logger.warn("Tag filtering not yet implemented");
      }

      // Handle other filters
      if (targetAudience.filters) {
        const { filters } = targetAudience;
        
        if (filters.hasEmail) {
          whereClause.email = {
            [require('sequelize').Op.ne]: null,
            [require('sequelize').Op.ne]: ''
          };
        }

        if (filters.createdAfter) {
          whereClause.createdAt = {
            [require('sequelize').Op.gte]: new Date(filters.createdAfter)
          };
        }

        if (filters.createdBefore) {
          whereClause.createdAt = {
            ...whereClause.createdAt,
            [require('sequelize').Op.lte]: new Date(filters.createdBefore)
          };
        }
      }

      const contacts = await Contact.findAll({
        where: whereClause,
        limit: 10000 // Safety limit
      });

      return contacts;
    } catch (error) {
      logger.error("Error getting target contacts:", error);
      return [];
    }
  }
}

export default new CampaignController();