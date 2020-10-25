import qrCode from "qrcode-terminal";
import { Client } from "whatsapp-web.js";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";

interface Session extends Client {
  id?: number;
}

const sessions: Session[] = [];

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      const io = getIO();
      const sessionName = whatsapp.name;
      let sessionCfg;

      if (whatsapp && whatsapp.session) {
        sessionCfg = JSON.parse(whatsapp.session);
      }

      const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
      if (sessionIndex !== -1) {
        sessions[sessionIndex].destroy();
        sessions.splice(sessionIndex, 1);
      }

      const wbot: Session = new Client({
        session: sessionCfg
      });

      wbot.initialize();

      wbot.on("qr", async qr => {
        console.log("Session:", sessionName);
        qrCode.generate(qr, { small: true });
        await whatsapp.update({ qrcode: qr, status: "qrcode" });
        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });
      });

      wbot.on("authenticated", async session => {
        console.log("Session:", sessionName, "AUTHENTICATED");
        await whatsapp.update({
          session: JSON.stringify(session),
          status: "authenticated"
        });
        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });
      });

      wbot.on("auth_failure", async msg => {
        console.error("Session:", sessionName, "AUTHENTICATION FAILURE", msg);
        await whatsapp.update({ status: "OFFLINE" });
        reject(new Error("Error starting whatsapp session."));
      });

      wbot.on("ready", async () => {
        console.log("Session:", sessionName, "READY");
        await whatsapp.update({
          status: "CONNECTED",
          qrcode: ""
        });
        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });
        wbot.sendPresenceAvailable();
        wbot.id = whatsapp.id;
        sessions.push(wbot);
        resolve(wbot);
      });
    } catch (err) {
      console.log(err);
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
    console.log(err);
  }
};
