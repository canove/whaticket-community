import { Client as Session } from "whatsapp-web.js";
import { getWbot } from "../libs/wbot";
import AppError from "../errors/AppError";
import GetDefaultWhatsApp from "./GetDefaultWhatsApp";
import Ticket from "../models/Ticket";

const GetTicketWbot = async (ticket: Ticket): Promise<Session> => {
  if (!ticket.whatsappId) {
    const defaultWhatsapp = await GetDefaultWhatsApp();

    if (!defaultWhatsapp) {
      throw new AppError("No default WhatsApp found. Check Connection page.");
    }
    await ticket.$set("whatsapp", defaultWhatsapp);
  }

  const wbot = getWbot(ticket.whatsappId);

  return wbot;
};

export default GetTicketWbot;
