import qrCode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";
import AppError from "../errors/AppError";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import { handleMessageForSyncUnreadMessages } from "../services/WbotServices/wbotMessageListener";
import { logger } from "../utils/logger";

interface Session extends Client {
  id?: number;
}

const sessions: Session[] = [];

const syncUnreadMessages = async (wbot: Session) => {
  console.log("--- syncUnreadMessages ---");

  let chats = await wbot.getChats();
  chats = chats.filter(chat => chat.unreadCount > 0);

  console.log("---  chats to syncUnreadMessages:", chats.length, "chats");

  const chatsChunksLimit = 5;

  const chunks = [];
  for (let i = 0; i < chats.length; i += chatsChunksLimit) {
    chunks.push(chats.slice(i, i + chatsChunksLimit));
  }

  console.log("---  START syncUnreadMessages");
  console.time("Loop Time");

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async chat => {
        try {
          // if (chat.unreadCount > 0) {
          const unreadMessages = await chat.fetchMessages({
            limit: chat.unreadCount
          });

          let lastTicket: Ticket | undefined;
          let lastContact: Contact | undefined;

          for (const msg of unreadMessages) {
            // await handleMessage(msg, wbot);
            let handleMessageForSyncUnreadMessagesResult =
              await handleMessageForSyncUnreadMessages(msg, wbot, chat);

            if (handleMessageForSyncUnreadMessagesResult) {
              lastTicket = handleMessageForSyncUnreadMessagesResult.ticket;
              lastContact = handleMessageForSyncUnreadMessagesResult.contact;
            }
          }

          // if (lastTicket && lastContact && !chat.isGroup) {
          //   const body = formatBody(
          //     `\u200e${"En estos momentos tenemos un alto flujo de mensajes. Te atenderemos en breve, muchas gracias por tu espera."}\n`,
          //     lastContact
          //   );

          //   const debouncedSentMessage = debounce(
          //     async () => {
          //       const sentMessage = await wbot.sendMessage(
          //         `${lastContact?.number}@c.us`,
          //         body
          //       );

          //       // @ts-ignore
          //       await verifyMessage(sentMessage, lastTicket, lastContact);
          //       await chat.sendSeen();
          //       await lastTicket?.update({ userHadContact: true });
          //     },
          //     3000,
          //     lastTicket.id
          //   );

          //   debouncedSentMessage();
          // } else {
          //   await chat.sendSeen();
          //   }

          if (lastTicket) {
            await lastTicket?.update({ userHadContact: true });
            await chat.sendSeen();
          }
        } catch (error) {
          console.error(`Error processing chat with id ${chat.id}:`, error);
        }
      })
    );
  }

  console.log("---  END syncUnreadMessages");
  console.timeEnd("Loop Time");
};

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      // const io = getIO();
      const sessionName = whatsapp.name;
      let sessionCfg;

      if (whatsapp && whatsapp.session) {
        sessionCfg = JSON.parse(whatsapp.session);
      }

      const args: String = process.env.CHROME_ARGS || "";

      const wbot: Session = new Client({
        session: sessionCfg,
        authStrategy: new LocalAuth({ clientId: `bd_${whatsapp.id}` }),
        puppeteer: {
          headless: true,
          ignoreHTTPSErrors: true,
          executablePath: process.env.CHROME_BIN || undefined,
          // @ts-ignore
          browserWSEndpoint: process.env.CHROME_WS || undefined,
          args: args.split(" ")
        }
      });

      wbot.initialize();

      wbot.on("qr", async qr => {
        logger.info("Session:", sessionName);
        qrCode.generate(qr, { small: true });
        await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        // io.emit("whatsappSession", {
        //   action: "update",
        //   session: whatsapp
        // });

        const url = process.env.NODE_URL + "/toEmit";
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            event: {
              name: "whatsappSession",
              data: {
                action: "update",
                session: whatsapp
              }
            }
          })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(
                "Network response was not ok " + response.statusText
              );
            }
            return response.json();
          })
          .then(data => {
            console.log("Success:", data);
          })
          .catch(error => {
            console.error("Error:", error);
          });
      });

      wbot.on("authenticated", async session => {
        logger.info(`Session: ${sessionName} AUTHENTICATED`);
      });

      wbot.on("auth_failure", async msg => {
        console.error(
          `Session: ${sessionName} AUTHENTICATION FAILURE! Reason: ${msg}`
        );

        if (whatsapp.retries > 1) {
          await whatsapp.update({ session: "", retries: 0 });
        }

        const retry = whatsapp.retries;
        await whatsapp.update({
          status: "DISCONNECTED",
          retries: retry + 1
        });

        // io.emit("whatsappSession", {
        //   action: "update",
        //   session: whatsapp
        // });

        const url = process.env.NODE_URL + "/toEmit";
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            event: {
              name: "whatsappSession",
              data: {
                action: "update",
                session: whatsapp
              }
            }
          })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(
                "Network response was not ok " + response.statusText
              );
            }
            return response.json();
          })
          .then(data => {
            console.log("Success:", data);
          })
          .catch(error => {
            console.error("Error:", error);
          });

        reject(new Error("Error starting whatsapp session."));
      });

      wbot.on("ready", async () => {
        logger.info(`Session: ${sessionName} READY`);

        // console.log("wbot info:", wbot.info);

        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0,
          ...(wbot.info?.wid?.user && { number: wbot.info?.wid?.user })
        });

        // io.emit("whatsappSession", {
        //   action: "update",
        //   session: whatsapp
        // });

        const url = process.env.NODE_URL + "/toEmit";
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            event: {
              name: "whatsappSession",
              data: {
                action: "update",
                session: whatsapp
              }
            }
          })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(
                "Network response was not ok " + response.statusText
              );
            }
            return response.json();
          })
          .then(data => {
            console.log("Success:", data);
          })
          .catch(error => {
            console.error("Error:", error);
          });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        // io.emit("startSyncUnreadMessages");

        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            event: {
              name: "startSyncUnreadMessages",
              data: {}
            }
          })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(
                "Network response was not ok " + response.statusText
              );
            }
            return response.json();
          })
          .then(data => {
            console.log("Success:", data);
          })
          .catch(error => {
            console.error("Error:", error);
          });

        wbot.sendPresenceAvailable();
        await syncUnreadMessages(wbot);

        // io.emit("endSyncUnreadMessages");

        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            event: {
              name: "endSyncUnreadMessages",
              data: {}
            }
          })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(
                "Network response was not ok " + response.statusText
              );
            }
            return response.json();
          })
          .then(data => {
            console.log("Success:", data);
          })
          .catch(error => {
            console.error("Error:", error);
          });

        resolve(wbot);
      });
    } catch (err) {
      logger.error(err);
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
