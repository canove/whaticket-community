import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";

const server = app.listen(process.env.PORT, () => {
  logger.info(`Server started on port: ${process.env.PORT}`);
});

// Inicializa Socket.IO
initIO(server);

// Inicialização robusta do WhatsApp Web.js com tratamento de erro
(async () => {
  try {
    logger.info("🚀 Iniciando sistema WhatsApp Web.js...");
    
    // WhatsApp é opcional - sistema continua funcionando mesmo se falhar
    await StartAllWhatsAppsSessions({
      delayBetweenSessions: 3000, // 3 segundos entre sessões
      optional: true, // WhatsApp é opcional
      maxConcurrent: 2 // Máximo 2 sessões simultâneas
    });

    logger.info("✅ Sistema backend totalmente operacional");
    
  } catch (error) {
    // Log do erro, mas não para o servidor
    logger.error("⚠ Erro na inicialização do WhatsApp (sistema continua operacional):", error);
    logger.warn("🔄 Sistema backend funcionando normalmente sem WhatsApp");
  }
})();

// Configuração do graceful shutdown
gracefulShutdown(server, {
  signals: 'SIGINT SIGTERM',
  timeout: 30000,
  development: false,
  onShutdown: (signal) => {
    logger.info(`🛑 Recebido sinal ${signal}, iniciando graceful shutdown...`);
    return Promise.resolve();
  },
  finally: () => {
    logger.info('👋 Servidor encerrado com sucesso');
  }
});
