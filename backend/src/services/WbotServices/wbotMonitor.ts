import * as Sentry from "@sentry/node";
import { Client } from "whatsapp-web.js";

import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { StartWhatsAppSession } from "./StartWhatsAppSession";

interface Session extends Client {
  id?: number;
}

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp
): Promise<void> => {
  const io = getIO();
  const sessionName = whatsapp.name;

  try {
    wbot.on("change_state", async newState => {
      console.log("Monitor session:", sessionName, newState);
      try {
        await whatsapp.update({ status: newState });
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
      }

      io.emit("whatsappSession", {
        action: "update",
        session: whatsapp
      });
    });

    wbot.on("change_battery", async batteryInfo => {
      const { battery, plugged } = batteryInfo;
      console.log(
        `Battery session: ${sessionName} ${battery}% - Charging? ${plugged}`
      );

      try {
        await whatsapp.update({ battery, plugged });
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
      }

      io.emit("whatsappSession", {
        action: "update",
        session: whatsapp
      });
    });

    wbot.on("disconnected", async reason => {
      console.log("Disconnected session:", sessionName, reason);
      try {
        await whatsapp.update({ status: "OPENING", session: "" });
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
      }

      io.emit("whatsappSession", {
        action: "update",
        session: whatsapp
      });

      setTimeout(() => StartWhatsAppSession(whatsapp), 2000);
    });
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
  }
};

export default wbotMonitor;
