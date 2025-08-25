import { EventEmitter } from "events";
import { logger } from "../../utils/logger";
import WebhookService from "../WebhookServices/WebhookService";

export interface SystemEvent {
  name: string;
  tenantId: number;
  data: Record<string, any>;
  timestamp?: Date;
  source?: string;
  userId?: number;
  contactId?: number;
  ticketId?: number;
  campaignId?: number;
}

class EventEmitterService extends EventEmitter {
  private static instance: EventEmitterService;

  constructor() {
    super();
    this.setMaxListeners(50); // Increase max listeners for webhooks
    this.setupInternalListeners();
  }

  static getInstance(): EventEmitterService {
    if (!EventEmitterService.instance) {
      EventEmitterService.instance = new EventEmitterService();
    }
    return EventEmitterService.instance;
  }

  private setupInternalListeners(): void {
    // Listen to all events and forward to webhooks
    this.onAny(async (eventName: string, eventData: SystemEvent) => {
      try {
        if (eventData.tenantId) {
          await WebhookService.sendWebhook({
            event: eventName,
            tenantId: eventData.tenantId,
            timestamp: eventData.timestamp || new Date(),
            data: eventData.data
          });
        }
      } catch (error) {
        logger.error(`Error forwarding event ${eventName} to webhooks:`, error);
      }
    });
  }

  /**
   * Emit a system event
   */
  async emitSystemEvent(event: SystemEvent): Promise<void> {
    try {
      const eventData = {
        ...event,
        timestamp: event.timestamp || new Date(),
        source: event.source || 'system'
      };

      logger.info(`Emitting event: ${event.name} for tenant ${event.tenantId}`);
      
      // Emit to internal listeners first
      this.emit(event.name, eventData);
      
      // Also emit to catch-all listeners
      this.emit('*', event.name, eventData);

    } catch (error) {
      logger.error(`Error emitting event ${event.name}:`, error);
    }
  }

  /**
   * Listen to any event (wildcard listener)
   */
  onAny(listener: (eventName: string, eventData: SystemEvent) => void): void {
    this.on('*', listener);
  }

  // Convenience methods for common events

  async emitMessageReceived(data: {
    tenantId: number;
    contactId: number;
    ticketId: number;
    messageId: string;
    message: string;
    fromMe: boolean;
    whatsappId?: number;
  }): Promise<void> {
    await this.emitSystemEvent({
      name: "message.received",
      tenantId: data.tenantId,
      contactId: data.contactId,
      ticketId: data.ticketId,
      data: {
        messageId: data.messageId,
        message: data.message,
        fromMe: data.fromMe,
        whatsappId: data.whatsappId
      }
    });
  }

  async emitMessageSent(data: {
    tenantId: number;
    contactId: number;
    ticketId: number;
    messageId: string;
    message: string;
    whatsappId?: number;
  }): Promise<void> {
    await this.emitSystemEvent({
      name: "message.sent",
      tenantId: data.tenantId,
      contactId: data.contactId,
      ticketId: data.ticketId,
      data: {
        messageId: data.messageId,
        message: data.message,
        whatsappId: data.whatsappId
      }
    });
  }

  async emitTicketCreated(data: {
    tenantId: number;
    ticketId: number;
    contactId: number;
    userId?: number;
    queueId?: number;
    status: string;
  }): Promise<void> {
    await this.emitSystemEvent({
      name: "ticket.created",
      tenantId: data.tenantId,
      ticketId: data.ticketId,
      contactId: data.contactId,
      userId: data.userId,
      data: {
        ticketId: data.ticketId,
        contactId: data.contactId,
        userId: data.userId,
        queueId: data.queueId,
        status: data.status
      }
    });
  }

  async emitTicketUpdated(data: {
    tenantId: number;
    ticketId: number;
    contactId: number;
    userId?: number;
    oldStatus?: string;
    newStatus: string;
    queueId?: number;
  }): Promise<void> {
    await this.emitSystemEvent({
      name: "ticket.updated",
      tenantId: data.tenantId,
      ticketId: data.ticketId,
      contactId: data.contactId,
      userId: data.userId,
      data: {
        ticketId: data.ticketId,
        contactId: data.contactId,
        userId: data.userId,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        queueId: data.queueId
      }
    });
  }

  async emitTicketClosed(data: {
    tenantId: number;
    ticketId: number;
    contactId: number;
    userId?: number;
    reason?: string;
  }): Promise<void> {
    await this.emitSystemEvent({
      name: "ticket.closed",
      tenantId: data.tenantId,
      ticketId: data.ticketId,
      contactId: data.contactId,
      userId: data.userId,
      data: {
        ticketId: data.ticketId,
        contactId: data.contactId,
        userId: data.userId,
        reason: data.reason
      }
    });
  }

  async emitCampaignStarted(data: {
    tenantId: number;
    campaignId: number;
    campaignName: string;
    totalContacts: number;
    userId?: number;
  }): Promise<void> {
    await this.emitSystemEvent({
      name: "campaign.started",
      tenantId: data.tenantId,
      campaignId: data.campaignId,
      userId: data.userId,
      data: {
        campaignId: data.campaignId,
        campaignName: data.campaignName,
        totalContacts: data.totalContacts,
        userId: data.userId
      }
    });
  }

  async emitCampaignCompleted(data: {
    tenantId: number;
    campaignId: number;
    campaignName: string;
    statistics: {
      totalContacts: number;
      sent: number;
      delivered: number;
      failed: number;
    };
    userId?: number;
  }): Promise<void> {
    await this.emitSystemEvent({
      name: "campaign.completed",
      tenantId: data.tenantId,
      campaignId: data.campaignId,
      userId: data.userId,
      data: {
        campaignId: data.campaignId,
        campaignName: data.campaignName,
        statistics: data.statistics,
        userId: data.userId
      }
    });
  }

  async emitCampaignPaused(data: {
    tenantId: number;
    campaignId: number;
    campaignName: string;
    userId?: number;
    reason?: string;
  }): Promise<void> {
    await this.emitSystemEvent({
      name: "campaign.paused",
      tenantId: data.tenantId,
      campaignId: data.campaignId,
      userId: data.userId,
      data: {
        campaignId: data.campaignId,
        campaignName: data.campaignName,
        userId: data.userId,
        reason: data.reason
      }
    });
  }

  async emitFlowCompleted(data: {
    tenantId: number;
    contactId: number;
    ticketId: number;
    flowId: number;
    flowName: string;
    executionId: number;
  }): Promise<void> {
    await this.emitSystemEvent({
      name: "flow.completed",
      tenantId: data.tenantId,
      contactId: data.contactId,
      ticketId: data.ticketId,
      data: {
        flowId: data.flowId,
        flowName: data.flowName,
        executionId: data.executionId,
        contactId: data.contactId,
        ticketId: data.ticketId
      }
    });
  }

  async emitContactCreated(data: {
    tenantId: number;
    contactId: number;
    contactName: string;
    contactNumber: string;
    email?: string;
  }): Promise<void> {
    await this.emitSystemEvent({
      name: "contact.created",
      tenantId: data.tenantId,
      contactId: data.contactId,
      data: {
        contactId: data.contactId,
        contactName: data.contactName,
        contactNumber: data.contactNumber,
        email: data.email
      }
    });
  }

  async emitContactUpdated(data: {
    tenantId: number;
    contactId: number;
    contactName: string;
    contactNumber: string;
    changes: Record<string, any>;
  }): Promise<void> {
    await this.emitSystemEvent({
      name: "contact.updated",
      tenantId: data.tenantId,
      contactId: data.contactId,
      data: {
        contactId: data.contactId,
        contactName: data.contactName,
        contactNumber: data.contactNumber,
        changes: data.changes
      }
    });
  }

  /**
   * Get event statistics
   */
  getEventStats(): {
    totalListeners: number;
    eventNames: string[];
    maxListeners: number;
  } {
    return {
      totalListeners: this.listenerCount('*'),
      eventNames: this.eventNames() as string[],
      maxListeners: this.getMaxListeners()
    };
  }

  /**
   * Clear all listeners (for testing or shutdown)
   */
  clearAllListeners(): void {
    this.removeAllListeners();
    this.setupInternalListeners(); // Re-setup internal webhook forwarding
  }
}

// Export singleton instance
export default EventEmitterService.getInstance();