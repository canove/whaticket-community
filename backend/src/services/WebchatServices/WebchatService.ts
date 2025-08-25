import { logger } from "../../utils/logger";
import WebchatSession from "../../models/WebchatSession";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import Tenant from "../../models/Tenant";
import Queue from "../../models/Queue";
import User from "../../models/User";
import { v4 as uuidv4 } from "uuid";
import EventEmitterService from "../EventServices/EventEmitterService";

export interface InitSessionData {
  sessionId: string;
  tenantId: number;
  visitorInfo: Record<string, any>;
  metadata: Record<string, any>;
  widgetId?: string;
  currentUrl?: string;
  pageTitle?: string;
}

export interface SendVisitorMessageData {
  tenantId: number;
  sessionId: string;
  message: string;
  visitorInfo?: Record<string, any>;
}

export interface SendAgentMessageData {
  tenantId: number;
  sessionId: string;
  message: string;
  userId: number;
}

class WebchatService {
  /**
   * Initialize a new webchat session
   */
  async initializeSession(data: InitSessionData): Promise<WebchatSession> {
    try {
      const { sessionId, tenantId, visitorInfo, metadata, widgetId, currentUrl, pageTitle } = data;

      // Check if session already exists
      let session = await WebchatSession.findOne({
        where: { sessionId, tenantId },
        include: [Contact, Ticket]
      });

      if (session) {
        // Update existing session activity
        await session.update({
          lastActivity: new Date(),
          currentUrl: currentUrl || session.currentUrl,
          pageTitle: pageTitle || session.pageTitle,
          isActive: true
        });
        return session;
      }

      // Create new session
      session = await WebchatSession.create({
        sessionId,
        tenantId,
        visitorInfo,
        metadata,
        widgetId,
        currentUrl,
        pageTitle,
        isActive: true,
        lastActivity: new Date()
      });

      logger.info(`New webchat session initialized: ${sessionId} for tenant ${tenantId}`);
      return session;
    } catch (error) {
      logger.error("Error initializing webchat session:", error);
      throw error;
    }
  }

  /**
   * Send message from visitor
   */
  async sendVisitorMessage(data: SendVisitorMessageData): Promise<Message> {
    try {
      const { tenantId, sessionId, message, visitorInfo } = data;

      // Get or create session
      let session = await WebchatSession.findOne({
        where: { sessionId, tenantId },
        include: [Contact, Ticket]
      });

      if (!session) {
        throw new Error("Webchat session not found");
      }

      // Update visitor info if provided
      if (visitorInfo) {
        await session.update({
          visitorInfo: { ...session.visitorInfo, ...visitorInfo }
        });
      }

      // Create or find contact
      let contact = session.contact;
      if (!contact) {
        contact = await this.createOrUpdateContact(session, visitorInfo);
        await session.update({ contactId: contact.id });
      }

      // Create or find ticket
      let ticket = session.ticket;
      if (!ticket) {
        ticket = await this.createTicketForSession(session, contact);
        await session.update({ ticketId: ticket.id });
      }

      // Create message
      const messageRecord = await Message.create({
        id: uuidv4(),
        body: message,
        fromMe: false,
        read: false,
        contactId: contact.id,
        ticketId: ticket.id,
        tenantId
      });

      // Update session stats
      const messageCount = session.messageCount + 1;
      const now = new Date();
      await session.update({
        messageCount,
        lastActivity: now,
        lastMessageAt: now,
        firstMessageAt: session.firstMessageAt || now
      });

      // Update ticket
      await ticket.update({
        lastMessage: message.length > 100 ? message.substring(0, 100) + '...' : message,
        updatedAt: now
      });

      // Emit event
      await EventEmitterService.emitMessageReceived({
        tenantId,
        contactId: contact.id,
        ticketId: ticket.id,
        messageId: messageRecord.id,
        message,
        fromMe: false
      });

      logger.info(`Webchat message received from visitor in session ${sessionId}`);
      return messageRecord;
    } catch (error) {
      logger.error("Error sending visitor message:", error);
      throw error;
    }
  }

  /**
   * Send message from agent
   */
  async sendAgentMessage(data: SendAgentMessageData): Promise<Message> {
    try {
      const { tenantId, sessionId, message, userId } = data;

      const session = await WebchatSession.findOne({
        where: { sessionId, tenantId },
        include: [Contact, Ticket]
      });

      if (!session || !session.ticket) {
        throw new Error("Webchat session or ticket not found");
      }

      // Create message
      const messageRecord = await Message.create({
        id: uuidv4(),
        body: message,
        fromMe: true,
        read: true,
        contactId: session.contactId!,
        ticketId: session.ticketId!,
        tenantId
      });

      // Update ticket
      await session.ticket.update({
        lastMessage: message.length > 100 ? message.substring(0, 100) + '...' : message,
        userId,
        updatedAt: new Date()
      });

      // Update session
      await session.update({
        lastActivity: new Date(),
        lastMessageAt: new Date()
      });

      // Emit event
      await EventEmitterService.emitMessageSent({
        tenantId,
        contactId: session.contactId!,
        ticketId: session.ticketId!,
        messageId: messageRecord.id,
        message
      });

      logger.info(`Agent message sent to webchat session ${sessionId}`);
      return messageRecord;
    } catch (error) {
      logger.error("Error sending agent message:", error);
      throw error;
    }
  }

  /**
   * Get session messages
   */
  async getSessionMessages(params: {
    tenantId: number;
    sessionId: string;
    limit?: number;
    offset?: number;
  }): Promise<Message[]> {
    try {
      const { tenantId, sessionId, limit = 50, offset = 0 } = params;

      const session = await WebchatSession.findOne({
        where: { sessionId, tenantId }
      });

      if (!session || !session.ticketId) {
        return [];
      }

      const messages = await Message.findAll({
        where: {
          ticketId: session.ticketId,
          tenantId
        },
        order: [['createdAt', 'ASC']],
        limit,
        offset,
        include: [
          {
            model: Contact,
            attributes: ['id', 'name', 'number']
          }
        ]
      });

      return messages;
    } catch (error) {
      logger.error("Error getting session messages:", error);
      throw error;
    }
  }

  /**
   * Update visitor information
   */
  async updateVisitorInfo(params: {
    tenantId: number;
    sessionId: string;
    visitorInfo: Record<string, any>;
  }): Promise<WebchatSession> {
    try {
      const { tenantId, sessionId, visitorInfo } = params;

      const session = await WebchatSession.findOne({
        where: { sessionId, tenantId },
        include: [Contact]
      });

      if (!session) {
        throw new Error("Webchat session not found");
      }

      // Update session visitor info
      await session.update({
        visitorInfo: { ...session.visitorInfo, ...visitorInfo },
        lastActivity: new Date()
      });

      // Update contact if exists
      if (session.contact) {
        await this.updateContactFromVisitorInfo(session.contact, visitorInfo);
      }

      return session;
    } catch (error) {
      logger.error("Error updating visitor info:", error);
      throw error;
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(params: {
    tenantId: number;
    sessionId: string;
    currentUrl?: string;
    pageTitle?: string;
  }): Promise<void> {
    try {
      const { tenantId, sessionId, currentUrl, pageTitle } = params;

      await WebchatSession.update(
        {
          lastActivity: new Date(),
          currentUrl: currentUrl || undefined,
          pageTitle: pageTitle || undefined
        },
        {
          where: { sessionId, tenantId }
        }
      );
    } catch (error) {
      logger.error("Error updating session activity:", error);
      throw error;
    }
  }

  /**
   * End webchat session
   */
  async endSession(params: {
    tenantId: number;
    sessionId: string;
    reason?: string;
  }): Promise<void> {
    try {
      const { tenantId, sessionId, reason } = params;

      const session = await WebchatSession.findOne({
        where: { sessionId, tenantId },
        include: [Ticket]
      });

      if (!session) {
        return; // Session already ended or doesn't exist
      }

      // Update session
      await session.update({
        isActive: false,
        endedAt: new Date(),
        endReason: reason || 'session_ended'
      });

      // Close ticket if exists and still open
      if (session.ticket && session.ticket.status !== 'closed') {
        await session.ticket.update({
          status: 'closed'
        });

        await EventEmitterService.emitTicketClosed({
          tenantId,
          ticketId: session.ticket.id,
          contactId: session.ticket.contactId,
          reason: 'webchat_ended'
        });
      }

      logger.info(`Webchat session ended: ${sessionId}`);
    } catch (error) {
      logger.error("Error ending session:", error);
      throw error;
    }
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(params: {
    tenantId: number;
    page?: number;
    limit?: number;
  }): Promise<{ sessions: WebchatSession[]; total: number; hasMore: boolean }> {
    try {
      const { tenantId, page = 1, limit = 20 } = params;
      const offset = (page - 1) * limit;

      const { count, rows } = await WebchatSession.findAndCountAll({
        where: {
          tenantId,
          isActive: true
        },
        include: [
          {
            model: Contact,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Ticket,
            attributes: ['id', 'status'],
            include: [
              {
                model: User,
                attributes: ['id', 'name']
              }
            ]
          }
        ],
        order: [['lastActivity', 'DESC']],
        limit,
        offset
      });

      return {
        sessions: rows,
        total: count,
        hasMore: offset + limit < count
      };
    } catch (error) {
      logger.error("Error getting active sessions:", error);
      throw error;
    }
  }

  /**
   * Get webchat configuration for tenant
   */
  async getWebchatConfig(tenantId: number): Promise<any> {
    try {
      const tenant = await Tenant.findByPk(tenantId);
      if (!tenant) {
        throw new Error("Tenant not found");
      }

      // Default webchat configuration
      return {
        enabled: true,
        welcomeMessage: "Olá! Como posso ajudá-lo hoje?",
        color: "#007bff",
        position: "bottom-right",
        showUserAvatar: true,
        showAgentAvatar: true,
        allowFileUpload: false,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        autoAssign: true,
        businessHours: {
          enabled: false,
          timezone: "America/Sao_Paulo",
          schedule: {
            monday: { start: "09:00", end: "18:00" },
            tuesday: { start: "09:00", end: "18:00" },
            wednesday: { start: "09:00", end: "18:00" },
            thursday: { start: "09:00", end: "18:00" },
            friday: { start: "09:00", end: "18:00" },
            saturday: null,
            sunday: null
          }
        }
      };
    } catch (error) {
      logger.error("Error getting webchat config:", error);
      throw error;
    }
  }

  /**
   * Generate widget script
   */
  async generateWidgetScript(params: {
    tenantId: number;
    widgetId?: string;
  }): Promise<string> {
    try {
      const { tenantId, widgetId = 'default' } = params;

      const config = await this.getWebchatConfig(tenantId);

      const script = `
(function() {
  var widgetConfig = ${JSON.stringify({
    tenantId,
    widgetId,
    apiUrl: process.env.BACKEND_URL || 'http://localhost:3000',
    ...config
  })};
  
  // Create widget container
  var container = document.createElement('div');
  container.id = 'whaticket-webchat-' + widgetConfig.tenantId;
  container.style.cssText = 'position: fixed; ' + widgetConfig.position.replace('-', ': 20px; ') + ': 20px; z-index: 999999;';
  
  // Add basic styling
  var style = document.createElement('style');
  style.textContent = \`
    #whaticket-webchat-\${widgetConfig.tenantId} {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .webchat-toggle {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: \${widgetConfig.color};
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      color: white;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .webchat-window {
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 5px 40px rgba(0,0,0,0.16);
      display: none;
      flex-direction: column;
      position: absolute;
      bottom: 80px;
      right: 0;
    }
  \`;
  
  document.head.appendChild(style);
  
  // Create toggle button
  var toggle = document.createElement('button');
  toggle.className = 'webchat-toggle';
  toggle.innerHTML = '💬';
  toggle.onclick = function() {
    var window = container.querySelector('.webchat-window');
    if (window.style.display === 'none') {
      window.style.display = 'flex';
      toggle.innerHTML = '✕';
    } else {
      window.style.display = 'none';
      toggle.innerHTML = '💬';
    }
  };
  
  // Create chat window
  var chatWindow = document.createElement('div');
  chatWindow.className = 'webchat-window';
  chatWindow.innerHTML = \`
    <div style="background: \${widgetConfig.color}; color: white; padding: 16px; border-radius: 8px 8px 0 0;">
      <h4 style="margin: 0;">Chat</h4>
    </div>
    <div style="flex: 1; padding: 16px;">
      <div style="color: #666;">\${widgetConfig.welcomeMessage}</div>
    </div>
    <div style="padding: 16px; border-top: 1px solid #eee;">
      <input type="text" placeholder="Digite sua mensagem..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
  \`;
  
  container.appendChild(toggle);
  container.appendChild(chatWindow);
  document.body.appendChild(container);
  
  // Initialize session
  var sessionId = localStorage.getItem('whaticket-session-' + widgetConfig.tenantId);
  if (!sessionId) {
    sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('whaticket-session-' + widgetConfig.tenantId, sessionId);
  }
  
  // Initialize webchat session
  fetch(widgetConfig.apiUrl + '/api/webchat/' + widgetConfig.tenantId + '/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: sessionId,
      widgetId: widgetConfig.widgetId,
      currentUrl: window.location.href,
      pageTitle: document.title,
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer
      }
    })
  }).catch(console.error);
  
})();
`;

      return script;
    } catch (error) {
      logger.error("Error generating widget script:", error);
      throw error;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(params: {
    tenantId: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      const { tenantId, startDate, endDate } = params;

      const whereClause: any = { tenantId };
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[require('sequelize').Op.gte] = startDate;
        if (endDate) whereClause.createdAt[require('sequelize').Op.lte] = endDate;
      }

      const totalSessions = await WebchatSession.count({ where: whereClause });
      const activeSessions = await WebchatSession.count({ 
        where: { ...whereClause, isActive: true } 
      });
      const completedSessions = await WebchatSession.count({ 
        where: { ...whereClause, isActive: false } 
      });

      return {
        totalSessions,
        activeSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
      };
    } catch (error) {
      logger.error("Error getting session stats:", error);
      throw error;
    }
  }

  // Private helper methods

  private async createOrUpdateContact(session: WebchatSession, visitorInfo?: Record<string, any>): Promise<Contact> {
    const info = { ...session.visitorInfo, ...visitorInfo };
    const name = info.name || `Visitante ${session.sessionId.substring(0, 8)}`;
    const email = info.email || '';
    
    // Try to find existing contact by email
    if (email) {
      const existing = await Contact.findOne({
        where: { email, tenantId: session.tenantId }
      });
      if (existing) {
        await this.updateContactFromVisitorInfo(existing, info);
        return existing;
      }
    }

    // Create new contact
    const contact = await Contact.create({
      name,
      number: `webchat-${session.sessionId}`,
      email,
      tenantId: session.tenantId
    });

    await EventEmitterService.emitContactCreated({
      tenantId: session.tenantId,
      contactId: contact.id,
      contactName: name,
      contactNumber: contact.number,
      email
    });

    return contact;
  }

  private async updateContactFromVisitorInfo(contact: Contact, visitorInfo: Record<string, any>): Promise<void> {
    const updates: any = {};
    
    if (visitorInfo.name && visitorInfo.name !== contact.name) {
      updates.name = visitorInfo.name;
    }
    
    if (visitorInfo.email && visitorInfo.email !== contact.email) {
      updates.email = visitorInfo.email;
    }

    if (Object.keys(updates).length > 0) {
      await contact.update(updates);
    }
  }

  private async createTicketForSession(session: WebchatSession, contact: Contact): Promise<Ticket> {
    // Find default queue for tenant
    const queue = await Queue.findOne({
      where: { tenantId: session.tenantId },
      order: [['id', 'ASC']]
    });

    const ticket = await Ticket.create({
      status: 'open',
      contactId: contact.id,
      tenantId: session.tenantId,
      queueId: queue?.id,
      isGroup: false,
      unreadMessages: 0
    });

    await EventEmitterService.emitTicketCreated({
      tenantId: session.tenantId,
      ticketId: ticket.id,
      contactId: contact.id,
      queueId: queue?.id,
      status: 'open'
    });

    return ticket;
  }
}

export default new WebchatService();