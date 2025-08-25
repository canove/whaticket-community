import qrCode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import { handleMessage } from "../services/WbotServices/wbotMessageListener";

interface Session extends Client {
  id?: number;
}

const sessions: Session[] = [];

const syncUnreadMessages = async (wbot: Session) => {
  const chats = await wbot.getChats();

  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-await-in-loop */
  for (const chat of chats) {
    if (chat.unreadCount > 0) {
      const unreadMessages = await chat.fetchMessages({
        limit: chat.unreadCount
      });

      for (const msg of unreadMessages) {
        await handleMessage(msg, wbot);
      }

      await chat.sendSeen();
    }
  }
};

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    const sessionName = whatsapp.name;
    logger.info(`Iniciando sessão WhatsApp: ${sessionName} (ID: ${whatsapp.id})`);
    
    // Timeout da Promise para evitar travamento
    const initTimeout = setTimeout(() => {
      logger.error(`Timeout na inicialização da sessão ${sessionName} após 120 segundos`);
      reject(new Error(`Timeout na inicialização da sessão ${sessionName}`));
    }, 120000); // 2 minutos

    try {
      const io = getIO();
      let sessionCfg;

      if (whatsapp && whatsapp.session) {
        try {
          sessionCfg = JSON.parse(whatsapp.session);
        } catch (parseError) {
          logger.warn(`Erro ao fazer parse da sessão ${sessionName}, usando sessão limpa:`, parseError);
          sessionCfg = null;
        }
      }

      // Argumentos Docker-friendly melhorados para o Puppeteer/Chrome
      const defaultArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--disable-plugins',
        '--disable-extensions-except',
        '--disable-hang-monitor',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-ipc-flooding-protection',
        '--disable-blink-features=AutomationControlled',
        '--disable-client-side-phishing-detection',
        `--user-data-dir=/tmp/chrome-user-data-${whatsapp.id}-${Date.now()}`,
        '--disable-crash-reporter',
        '--disable-in-process-stack-traces',
        '--disable-logging',
        '--silent',
        '--memory-pressure-off',
        '--max_old_space_size=512'
      ];

      const customArgs = process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(' ') : [];
      const chromeArgs = [...defaultArgs, ...customArgs];

      const wbot: Session = new Client({
        session: sessionCfg,
        authStrategy: new LocalAuth({clientId: 'bd_'+whatsapp.id}),
        puppeteer: {
          headless: true,
          executablePath: process.env.CHROME_BIN || undefined,
          // @ts-ignore
          browserWSEndpoint: process.env.CHROME_WS || undefined,
          args: chromeArgs,
          timeout: 90000, // Aumentado para 90 segundos
          handleSIGINT: false,
          handleSIGTERM: false,
          handleSIGHUP: false,
          // Configurações adicionais para estabilidade
          slowMo: 100, // Adiciona delay entre ações
          defaultViewport: null,
          ignoreDefaultArgs: false
        }
      });

      // Variáveis de controle para evitar múltiplas resoluções/rejeições
      let isResolved = false;
      let isRejected = false;

      // Função para limpar timeout e resolver
      const cleanResolve = (result: Session) => {
        if (!isResolved && !isRejected) {
          isResolved = true;
          clearTimeout(initTimeout);
          resolve(result);
        }
      };

      // Função para limpar timeout e rejeitar
      const cleanReject = (error: Error) => {
        if (!isResolved && !isRejected) {
          isRejected = true;
          clearTimeout(initTimeout);
          reject(error);
        }
      };

      // Tratamento de erro de inicialização
      wbot.on('error', (error) => {
        logger.error(`Erro na sessão ${sessionName}:`, error);
        cleanReject(new Error(`Erro na sessão ${sessionName}: ${error.message}`));
      });

      // Tratamento de desconexão
      wbot.on('disconnected', (reason) => {
        logger.warn(`Sessão ${sessionName} desconectada: ${reason}`);
        if (!isResolved) {
          cleanReject(new Error(`Sessão ${sessionName} desconectada: ${reason}`));
        }
      });

      // Inicialização com tratamento de erro robusto
      try {
        logger.info(`Inicializando cliente WhatsApp para sessão: ${sessionName}`);
        wbot.initialize().catch((initError) => {
          logger.error(`Erro crítico na inicialização da sessão ${sessionName}:`, initError);
          cleanReject(new Error(`Erro crítico na inicialização: ${initError.message}`));
        });
      } catch (syncError) {
        logger.error(`Erro síncrono na inicialização da sessão ${sessionName}:`, syncError);
        cleanReject(new Error(`Erro síncrono na inicialização: ${syncError.message}`));
      }

      wbot.on("qr", async qr => {
        logger.info(`QR Code gerado para sessão: ${sessionName}`);
        qrCode.generate(qr, { small: true });
        await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });
      });

      wbot.on("authenticated", async session => {
        logger.info(`Sessão ${sessionName} AUTENTICADA com sucesso`);
      });

      wbot.on("auth_failure", async msg => {
        logger.error(`FALHA DE AUTENTICAÇÃO na sessão ${sessionName}! Motivo: ${msg}`);

        if (whatsapp.retries > 1) {
          await whatsapp.update({ session: "", retries: 0 });
        }

        const retry = whatsapp.retries;
        await whatsapp.update({
          status: "DISCONNECTED",
          retries: retry + 1
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        cleanReject(new Error(`Falha de autenticação na sessão ${sessionName}: ${msg}`));
      });

      wbot.on("ready", async () => {
        logger.info(`Sessão ${sessionName} PRONTA e operacional`);

        try {
          await whatsapp.update({
            status: "CONNECTED",
            qrcode: "",
            retries: 0
          });

          io.emit("whatsappSession", {
            action: "update",
            session: whatsapp
          });

          const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
          if (sessionIndex === -1) {
            wbot.id = whatsapp.id;
            sessions.push(wbot);
          }

          await wbot.sendPresenceAvailable();
          await syncUnreadMessages(wbot);

          logger.info(`Sessão ${sessionName} totalmente configurada e sincronizada`);
          cleanResolve(wbot);
        } catch (readyError) {
          logger.error(`Erro ao finalizar configuração da sessão ${sessionName}:`, readyError);
          cleanReject(new Error(`Erro ao finalizar configuração: ${readyError.message}`));
        }
      });

    } catch (err) {
      logger.error(`Erro geral na inicialização da sessão ${sessionName}:`, err);
      clearTimeout(initTimeout);
      reject(new Error(`Erro geral na inicialização: ${err.message}`));
    }
  });
};

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const removeWbot = (whatsappId: number): void => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].destroy();
      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};