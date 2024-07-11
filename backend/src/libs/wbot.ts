import qrCode from "qrcode-terminal";
import {
  Chat,
  Client,
  LocalAuth,
  Message as WbotMessage
} from "whatsapp-web.js";
import AppError from "../errors/AppError";
import Contact from "../models/Contact";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import { handleMessage } from "../services/WbotServices/wbotMessageListener";
import { logger } from "../utils/logger";

interface Session extends Client {
  id?: number;
}

const sessions: Session[] = [];

const fetchWbotMessagesGraduallyUpToATimestamp = async ({
  wbotChat,
  limit,
  timestamp
}: {
  wbotChat: Chat;
  limit?: number;
  timestamp: number;
}): Promise<WbotMessage[]> => {
  const chatMessages = await wbotChat.fetchMessages({ limit });

  const msgBeforeTimestampFound = chatMessages.find(
    msg => msg.timestamp <= timestamp
  );

  if (!msgBeforeTimestampFound && limit < 200) {
    return fetchWbotMessagesGraduallyUpToATimestamp({
      wbotChat,
      limit: limit + 20,
      timestamp
    });
  }

  return chatMessages.filter(msg => msg.timestamp > timestamp);
};

const syncUnreadMessages = async ({
  wbot,
  allWhatsappTickets,
  whatsapp
}: {
  wbot: Session;
  allWhatsappTickets: Ticket[];
  whatsapp: Whatsapp;
}) => {
  console.log("--- START syncUnreadMessages --- ", whatsapp.name);

  const url = process.env.NODE_URL + "/toEmit";

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
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log("Success:", data);
    })
    .catch(error => {
      console.error("Error:", error);
    });

  console.time("Loop Time");

  let chats = await wbot.getChats();

  // filter chats with last message in the last 8 hours
  let last8HoursChats = chats.filter(chat =>
    chat.lastMessage
      ? chat.lastMessage.timestamp > Date.now() / 1000 - 28800 // 8 hours in seconds
      : false
  );

  console.log(
    "---  chats to syncUnreadMessages:",
    last8HoursChats.length,
    "chats",
    last8HoursChats.map(chat => chat.name)
  );

  await Promise.all(
    last8HoursChats.map(async chat => {
      const chatContact = await Contact.findOne({
        where: {
          number: chat.id.user
        }
      });

      const lastTicketForThisChat = allWhatsappTickets.find(t => {
        return t.contactId === chatContact?.id;
      });

      let timestampUpToFetchMessages = Date.now() / 1000 - 28800; // 8 hours in seconds

      if (
        lastTicketForThisChat &&
        lastTicketForThisChat.messages.length > 0 &&
        lastTicketForThisChat.messages[0].timestamp
      ) {
        timestampUpToFetchMessages =
          lastTicketForThisChat.messages[0].timestamp;
      } else {
        console.log("no hay lastOpenTicket o no hay messages");
      }

      const wppMessagesAfterLastMessageTimestamp =
        await fetchWbotMessagesGraduallyUpToATimestamp({
          limit: 20,
          timestamp: timestampUpToFetchMessages,
          wbotChat: chat
        });

      console.log(
        "lo que se mandaria a fetchWbotMessagesGraduallyUpToATimestamp y resultado",
        {
          limit: 20,
          lastMessageTimestamp:
            lastTicketForThisChat?.messages[0].timestamp || null,
          lastMessageBody: lastTicketForThisChat?.messages[0].body || null,
          wbotChat: chat.name,
          wppMessagesAfterLastMessageTimestamp:
            wppMessagesAfterLastMessageTimestamp.length
        }
      );

      if (wppMessagesAfterLastMessageTimestamp.length > 0) {
        console.log("hay mensajes nuevos");
        for (const msg of wppMessagesAfterLastMessageTimestamp) {
          await handleMessage(msg, wbot);
        }
      }
    })
  );

  console.log("---  END syncUnreadMessages");
  console.timeEnd("Loop Time");

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
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log("Success:", data);
    })
    .catch(error => {
      console.error("Error:", error);
    });
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

        wbot.sendPresenceAvailable();

        const allWhatsappTickets = await Ticket.findAll({
          where: {
            whatsappId: whatsapp.id
          },
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: Message,
              as: "messages",
              order: [["timestamp", "DESC"]],
              required: false,
              limit: 1
            }
          ]
        });

        syncUnreadMessages({
          wbot,
          allWhatsappTickets,
          whatsapp
        });

        // io.emit("endSyncUnreadMessages");

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

export const getWbots = (): Session[] => {
  return sessions;
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
