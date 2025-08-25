import { Router } from "express";
import PublicAPIController from "../../../controllers/api/v2/PublicAPIController";
import { 
  apiAuthMiddleware, 
  requirePermission, 
  createAPIKeyRateLimit,
  apiUsageLogger,
  validateAPIKeyFormat
} from "../../../middleware/apiAuth";

const router = Router();

// Middleware global para todas as rotas da API v2
router.use(validateAPIKeyFormat);
router.use(apiAuthMiddleware);
router.use(createAPIKeyRateLimit());
router.use(apiUsageLogger);

/**
 * @swagger
 * /api/v2/status:
 *   get:
 *     tags: [API Status]
 *     summary: Verificar status da API
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Status da API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 version:
 *                   type: string
 *                   example: "2.0.0"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/status", PublicAPIController.getStatus);

/**
 * @swagger
 * /api/v2/messages:
 *   post:
 *     tags: [Messages]
 *     summary: Enviar mensagem
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - message
 *             properties:
 *               to:
 *                 type: string
 *                 description: Número do destinatário
 *                 example: "5511999999999"
 *               message:
 *                 type: string
 *                 description: Conteúdo da mensagem
 *                 example: "Olá! Como posso ajudar?"
 *               mediaUrl:
 *                 type: string
 *                 description: URL da mídia (opcional)
 *               mediaType:
 *                 type: string
 *                 description: Tipo da mídia (opcional)
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso
 *   get:
 *     tags: [Messages]
 *     summary: Listar mensagens
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de mensagens
 */
router.post("/messages", requirePermission("messages", "create"), PublicAPIController.sendMessage);
router.get("/messages", requirePermission("messages", "list"), PublicAPIController.getMessages);

/**
 * @swagger
 * /api/v2/messages/{id}:
 *   get:
 *     tags: [Messages]
 *     summary: Obter mensagem específica
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da mensagem
 *     responses:
 *       200:
 *         description: Detalhes da mensagem
 *       404:
 *         description: Mensagem não encontrada
 */
router.get("/messages/:id", requirePermission("messages", "read"), PublicAPIController.getMessage);

/**
 * @swagger
 * /api/v2/contacts:
 *   get:
 *     tags: [Contacts]
 *     summary: Listar contatos
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome ou número
 *     responses:
 *       200:
 *         description: Lista de contatos
 *   post:
 *     tags: [Contacts]
 *     summary: Criar contato
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - number
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do contato
 *                 example: "João Silva"
 *               number:
 *                 type: string
 *                 description: Número do contato
 *                 example: "5511999999999"
 *               email:
 *                 type: string
 *                 description: Email do contato (opcional)
 *                 example: "joao@email.com"
 *     responses:
 *       201:
 *         description: Contato criado com sucesso
 *       409:
 *         description: Contato já existe
 */
router.get("/contacts", requirePermission("contacts", "list"), PublicAPIController.getContacts);
router.post("/contacts", requirePermission("contacts", "create"), PublicAPIController.createContact);

/**
 * @swagger
 * /api/v2/ai/transcriptions:
 *   get:
 *     tags: [AI Transcription]
 *     summary: Listar transcrições de áudio
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de transcrições
 */
router.get("/ai/transcriptions", requirePermission("ai", "read"), PublicAPIController.getTranscriptions);

/**
 * @swagger
 * /api/v2/ai/transcribe:
 *   post:
 *     tags: [AI Transcription]
 *     summary: Solicitar transcrição de áudio
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: ID da mensagem de áudio
 *                 example: "msg_123456789"
 *     responses:
 *       200:
 *         description: Transcrição iniciada
 *       400:
 *         description: Mensagem não é de áudio
 *       404:
 *         description: Mensagem não encontrada
 */
router.post("/ai/transcribe", requirePermission("ai", "execute"), PublicAPIController.requestTranscription);

/**
 * @swagger
 * /api/v2/auth/usage:
 *   get:
 *     tags: [Authentication]
 *     summary: Obter estatísticas de uso da API key
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas de uso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKey:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     rateLimit:
 *                       type: integer
 *                 usage:
 *                   type: object
 *                   properties:
 *                     totalRequests:
 *                       type: integer
 *                     avgRequestsPerDay:
 *                       type: integer
 *                     lastUsed:
 *                       type: string
 *                       format: date-time
 */
router.get("/auth/usage", PublicAPIController.getAPIUsage);

export default router;