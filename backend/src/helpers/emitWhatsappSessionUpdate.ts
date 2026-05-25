import Whatsapp from "../models/Whatsapp.js";
import { getIO } from "../libs/socket.js";

export const emitWhatsappSessionUpdate = (whatsapp: Whatsapp): void => {
  getIO().to("notification").emit("whatsappSession", {
    action: "update",
    session: whatsapp
  });
};
