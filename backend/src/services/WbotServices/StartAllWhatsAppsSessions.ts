import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";
import { StartWhatsAppSession } from "./StartWhatsAppSession";
import { logger } from "../../utils/logger";

interface WhatsAppStartOptions {
  delayBetweenSessions?: number;
  optional?: boolean;
  maxConcurrent?: number;
}

export const StartAllWhatsAppsSessions = async (
  options: WhatsAppStartOptions = {}
): Promise<void> => {
  const {
    delayBetweenSessions = 2000, // 2 segundos entre cada sessão
    optional = true, // WhatsApp é opcional por padrão
    maxConcurrent = 3 // Máximo 3 sessões simultâneas
  } = options;

  try {
    logger.info("Iniciando processo de carregamento das sessões WhatsApp...");
    
    const whatsapps = await ListWhatsAppsService();
    
    if (!whatsapps || whatsapps.length === 0) {
      logger.info("Nenhuma sessão WhatsApp encontrada para inicializar");
      return;
    }

    logger.info(`Encontradas ${whatsapps.length} sessões WhatsApp para inicializar`);

    // Inicialização sequencial com delay para evitar sobrecarga
    let successCount = 0;
    let failureCount = 0;
    let currentConcurrent = 0;
    const promises = [];

    for (let i = 0; i < whatsapps.length; i++) {
      const whatsapp = whatsapps[i];
      
      // Aguarda se já temos muitas sessões concorrentes
      if (currentConcurrent >= maxConcurrent) {
        logger.info(`Aguardando conclusão de sessões em andamento (${currentConcurrent}/${maxConcurrent})...`);
        await Promise.race(promises);
      }

      logger.info(`Iniciando sessão WhatsApp ${i + 1}/${whatsapps.length}: ${whatsapp.name}`);
      
      const sessionPromise = StartWhatsAppSession(whatsapp, { optional })
        .then(() => {
          successCount++;
          currentConcurrent--;
          logger.info(`✓ Sessão ${whatsapp.name} iniciada com sucesso (${successCount} sucessos, ${failureCount} falhas)`);
        })
        .catch((error) => {
          failureCount++;
          currentConcurrent--;
          if (optional) {
            logger.warn(`⚠ Sessão ${whatsapp.name} falhou (modo opcional): ${error.message}`);
          } else {
            logger.error(`✗ Sessão ${whatsapp.name} falhou (modo obrigatório): ${error.message}`);
            throw error; // Re-throw se não for opcional
          }
        });

      promises.push(sessionPromise);
      currentConcurrent++;

      // Delay entre inicializações para evitar sobrecarga do sistema
      if (i < whatsapps.length - 1 && delayBetweenSessions > 0) {
        logger.debug(`Aguardando ${delayBetweenSessions}ms antes da próxima sessão...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenSessions));
      }
    }

    // Aguarda todas as sessões terminarem
    logger.info("Aguardando conclusão de todas as sessões WhatsApp...");
    await Promise.allSettled(promises);

    // Relatório final
    const totalSessions = whatsapps.length;
    logger.info(`🏁 Processo de inicialização WhatsApp concluído:`);
    logger.info(`   Total de sessões: ${totalSessions}`);
    logger.info(`   Sucessos: ${successCount}`);
    logger.info(`   Falhas: ${failureCount}`);
    
    if (successCount > 0) {
      logger.info(`✓ Sistema operacional com ${successCount} sessão(ões) WhatsApp ativa(s)`);
    } else if (optional) {
      logger.warn(`⚠ Nenhuma sessão WhatsApp ativa, mas sistema continua operacional (modo opcional)`);
    } else {
      throw new Error(`Falha crítica: Nenhuma sessão WhatsApp foi inicializada com sucesso`);
    }

  } catch (error) {
    logger.error("Erro crítico no processo de inicialização das sessões WhatsApp:", error);
    
    if (optional) {
      logger.warn("WhatsApp está em modo opcional - sistema continuará sem WhatsApp");
    } else {
      logger.error("WhatsApp está em modo obrigatório - falha crítica do sistema");
      throw error; // Re-throw se WhatsApp for obrigatório
    }
  }
};
