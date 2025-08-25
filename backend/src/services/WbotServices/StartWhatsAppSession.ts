import { initWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import { logger } from "../../utils/logger";

interface WhatsAppSessionOptions {
  maxRetries?: number;
  retryDelay?: number;
  optional?: boolean;
}

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp,
  options: WhatsAppSessionOptions = {}
): Promise<void> => {
  const {
    maxRetries = 3,
    retryDelay = 5000,
    optional = true // Torna WhatsApp opcional por padrão
  } = options;

  const sessionName = whatsapp.name;
  let currentRetry = 0;

  logger.info(`Iniciando sessão WhatsApp: ${sessionName} (Tentativa: ${currentRetry + 1}/${maxRetries + 1})`);

  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.emit("whatsappSession", {
    action: "update",
    session: whatsapp
  });

  const attemptSession = async (): Promise<void> => {
    try {
      logger.info(`Tentativa ${currentRetry + 1} de inicialização da sessão ${sessionName}`);
      
      const wbot = await initWbot(whatsapp);
      wbotMessageListener(wbot);
      wbotMonitor(wbot, whatsapp);
      
      logger.info(`Sessão WhatsApp ${sessionName} iniciada com sucesso na tentativa ${currentRetry + 1}`);
      return;
      
    } catch (error) {
      logger.error(`Erro na tentativa ${currentRetry + 1} de inicialização da sessão ${sessionName}:`, error);
      
      await whatsapp.update({
        status: "DISCONNECTED",
        retries: currentRetry + 1
      });

      io.emit("whatsappSession", {
        action: "update",
        session: whatsapp
      });

      if (currentRetry < maxRetries) {
        currentRetry++;
        logger.warn(`Reagendando tentativa ${currentRetry + 1} para a sessão ${sessionName} em ${retryDelay}ms`);
        
        setTimeout(() => {
          attemptSession().catch((retryError) => {
            logger.error(`Erro na tentativa de retry para sessão ${sessionName}:`, retryError);
            if (!optional) {
              throw retryError;
            }
          });
        }, retryDelay);
        
        return;
      }

      // Todas as tentativas falharam
      logger.error(`Falha definitiva na inicialização da sessão ${sessionName} após ${maxRetries + 1} tentativas`);
      
      await whatsapp.update({
        status: "DISCONNECTED",
        retries: maxRetries + 1
      });

      io.emit("whatsappSession", {
        action: "update",
        session: whatsapp
      });

      if (!optional) {
        throw new Error(`Falha definitiva na inicialização da sessão ${sessionName}: ${error.message}`);
      } else {
        logger.warn(`Sessão WhatsApp ${sessionName} marcada como opcional - continuando operação sem WhatsApp`);
      }
    }
  };

  // Inicia o processo de tentativas
  return attemptSession();
};
