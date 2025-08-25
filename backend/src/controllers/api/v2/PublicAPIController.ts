import { Request, Response } from "express";
import { logger } from "../../../utils/logger";
import Message from "../../../models/Message";
import Contact from "../../../models/Contact";
import Ticket from "../../../models/Ticket";
import AudioTranscriptionService from "../../../services/AIServices/AudioTranscriptionService";
import APIKeyService from "../../../services/APIServices/APIKeyService";
import AppError from "../../../errors/AppError";

class PublicAPIController {
  /**
   * GET /api/v2/status
   * Endpoint para verificar status da API
   */
  public async getStatus(req: Request, res: Response): Promise<Response> {
    try {
      const apiKey = req.apiKey!;
      
      return res.json({
        status: "ok",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        tenant: req.apiTenant?.id,
        rateLimit: {
          limit: apiKey.rateLimit,
          window: apiKey.rateLimitWindow
        }
      });
    } catch (error) {
      logger.error("Erro no status da API:", error);
      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }

  /**
   * POST /api/v2/messages
   * Enviar mensagem via API
   */
  public async sendMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { to, message, mediaUrl, mediaType } = req.body;
      const tenantId = req.apiTenant!.id;

      if (!to || !message) {
        throw new AppError("Campos 'to' e 'message' são obrigatórios", 400);
      }

      // Validação básica de número
      const phoneNumber = to.replace(/\D/g, '');
      if (phoneNumber.length < 10) {
        throw new AppError("Número de telefone inválido", 400);
      }

      // TODO: Implementar envio real via WhatsApp
      // Por enquanto apenas simulamos o envio
      
      const messageData = {
        id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        body: message,
        fromMe: true,
        read: true,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || "chat",
        tenantId
      };

      return res.json({
        success: true,
        message: {
          id: messageData.id,
          to: phoneNumber,
          message,
          mediaUrl: mediaUrl || null,
          status: "sent",
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error("Erro ao enviar mensagem:", error);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.message
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }

  /**
   * GET /api/v2/messages
   * Listar mensagens
   */
  public async getMessages(req: Request, res: Response): Promise<Response> {
    try {
      const tenantId = req.apiTenant!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = (page - 1) * limit;

      const { count, rows: messages } = await Message.findAndCountAll({
        where: { tenantId },
        include: [
          {
            model: Contact,
            as: "contact",
            attributes: ["id", "name", "number"]
          },
          {
            model: Ticket,
            as: "ticket",
            attributes: ["id", "status"]
          }
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]]
      });

      return res.json({
        messages: messages.map(message => ({
          id: message.id,
          body: message.body,
          fromMe: message.fromMe,
          read: message.read,
          mediaUrl: message.mediaUrl,
          mediaType: message.mediaType,
          contact: message.contact ? {
            id: message.contact.id,
            name: message.contact.name,
            number: message.contact.number
          } : null,
          ticket: message.ticket ? {
            id: message.ticket.id,
            status: message.ticket.status
          } : null,
          createdAt: message.createdAt
        })),
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      logger.error("Erro ao listar mensagens:", error);
      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }

  /**
   * GET /api/v2/messages/:id
   * Obter mensagem específica
   */
  public async getMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const tenantId = req.apiTenant!.id;

      const message = await Message.findOne({
        where: { 
          id,
          tenantId 
        },
        include: [
          {
            model: Contact,
            as: "contact",
            attributes: ["id", "name", "number", "profilePicUrl"]
          },
          {
            model: Ticket,
            as: "ticket",
            attributes: ["id", "status", "userId"]
          }
        ]
      });

      if (!message) {
        return res.status(404).json({
          error: "Mensagem não encontrada"
        });
      }

      return res.json({
        message: {
          id: message.id,
          body: message.body,
          fromMe: message.fromMe,
          read: message.read,
          mediaUrl: message.mediaUrl,
          mediaType: message.mediaType,
          contact: message.contact ? {
            id: message.contact.id,
            name: message.contact.name,
            number: message.contact.number,
            profilePicUrl: message.contact.profilePicUrl
          } : null,
          ticket: message.ticket ? {
            id: message.ticket.id,
            status: message.ticket.status,
            userId: message.ticket.userId
          } : null,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        }
      });

    } catch (error) {
      logger.error("Erro ao obter mensagem:", error);
      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }

  /**
   * GET /api/v2/contacts
   * Listar contatos
   */
  public async getContacts(req: Request, res: Response): Promise<Response> {
    try {
      const tenantId = req.apiTenant!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = (page - 1) * limit;
      const search = req.query.search as string;

      const where: any = { tenantId };
      
      if (search) {
        const { Op } = require("sequelize");
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { number: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: contacts } = await Contact.findAndCountAll({
        where,
        limit,
        offset,
        order: [["name", "ASC"]]
      });

      return res.json({
        contacts: contacts.map(contact => ({
          id: contact.id,
          name: contact.name,
          number: contact.number,
          email: contact.email,
          profilePicUrl: contact.profilePicUrl,
          isGroup: contact.isGroup,
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt
        })),
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      logger.error("Erro ao listar contatos:", error);
      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }

  /**
   * POST /api/v2/contacts
   * Criar contato
   */
  public async createContact(req: Request, res: Response): Promise<Response> {
    try {
      const { name, number, email } = req.body;
      const tenantId = req.apiTenant!.id;

      if (!name || !number) {
        throw new AppError("Campos 'name' e 'number' são obrigatórios", 400);
      }

      // Verifica se contato já existe
      const existingContact = await Contact.findOne({
        where: { number, tenantId }
      });

      if (existingContact) {
        throw new AppError("Contato já existe com este número", 409);
      }

      const contact = await Contact.create({
        name,
        number: number.replace(/\D/g, ''),
        email,
        tenantId
      });

      return res.status(201).json({
        contact: {
          id: contact.id,
          name: contact.name,
          number: contact.number,
          email: contact.email,
          createdAt: contact.createdAt
        }
      });

    } catch (error) {
      logger.error("Erro ao criar contato:", error);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.message
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }

  /**
   * GET /api/v2/ai/transcriptions
   * Listar transcrições de áudio
   */
  public async getTranscriptions(req: Request, res: Response): Promise<Response> {
    try {
      const tenantId = req.apiTenant!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const status = req.query.status as string;

      const transcriptionsData = await AudioTranscriptionService.listTranscriptions(
        tenantId,
        {
          status: status as any,
          limit,
          offset: (page - 1) * limit
        }
      );

      return res.json({
        transcriptions: transcriptionsData.transcriptions.map(t => ({
          id: t.id,
          messageId: t.messageId,
          audioUrl: t.audioUrl,
          transcription: t.transcription,
          confidence: t.confidence,
          provider: t.provider,
          status: t.status,
          processingTimeMs: t.processingTimeMs,
          errorMessage: t.errorMessage,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt
        })),
        pagination: {
          page,
          limit,
          total: transcriptionsData.total,
          pages: Math.ceil(transcriptionsData.total / limit)
        }
      });

    } catch (error) {
      logger.error("Erro ao listar transcrições:", error);
      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }

  /**
   * POST /api/v2/ai/transcribe
   * Solicitar transcrição de áudio
   */
  public async requestTranscription(req: Request, res: Response): Promise<Response> {
    try {
      const { messageId } = req.body;
      const tenantId = req.apiTenant!.id;

      if (!messageId) {
        throw new AppError("Campo 'messageId' é obrigatório", 400);
      }

      // Verifica se a mensagem existe e é de áudio
      const message = await Message.findOne({
        where: { id: messageId, tenantId }
      });

      if (!message) {
        throw new AppError("Mensagem não encontrada", 404);
      }

      if (message.mediaType !== "audio") {
        throw new AppError("Mensagem não é de áudio", 400);
      }

      // Inicia transcrição
      const transcription = await AudioTranscriptionService.processAudioMessage(
        messageId,
        tenantId
      );

      if (!transcription) {
        throw new AppError("Não foi possível processar a transcrição", 500);
      }

      return res.json({
        transcription: {
          id: transcription.id,
          messageId: transcription.messageId,
          status: transcription.status,
          transcription: transcription.transcription,
          confidence: transcription.confidence,
          provider: transcription.provider,
          createdAt: transcription.createdAt
        }
      });

    } catch (error) {
      logger.error("Erro ao solicitar transcrição:", error);
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.message
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }

  /**
   * GET /api/v2/auth/usage
   * Obter estatísticas de uso da API key
   */
  public async getAPIUsage(req: Request, res: Response): Promise<Response> {
    try {
      const apiKey = req.apiKey!;
      
      const stats = await APIKeyService.getAPIKeyStats(
        apiKey.id,
        apiKey.tenantId
      );

      return res.json({
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          isActive: apiKey.isActive,
          rateLimit: apiKey.rateLimit,
          rateLimitWindow: apiKey.rateLimitWindow
        },
        usage: stats
      });

    } catch (error) {
      logger.error("Erro ao obter uso da API:", error);
      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }
}

export default new PublicAPIController();