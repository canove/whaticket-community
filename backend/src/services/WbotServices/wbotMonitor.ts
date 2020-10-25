import * as Sentry from "@sentry/node";
import { Client } from "whatsapp-web.js";

import wbotMessageListener from "./wbotMessageListener";

import { getIO } from "../../libs/socket";
import { initWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";

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
        await whatsapp.update({ status: "disconnected" });
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
      }

      io.emit("whatsappSession", {
        action: "update",
        session: whatsapp
      });

      // to be removed after adding buttons to rebuild session on frontend

      setTimeout(
        () =>
          initWbot(whatsapp)
            .then(() => {
              wbotMessageListener(wbot);
              wbotMonitor(wbot, whatsapp);
            })
            .catch(err => {
              Sentry.captureException(err);
              console.log(err);
            }),
        2000
      );
    });

    // setInterval(() => {
    // 	wbot.resetState();
    // }, 20000);
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
  }
};

export default wbotMonitor;
