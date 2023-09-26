import { Client, Message as WbotMessage } from "whatsapp-web.js";
import Ticket from "../models/Ticket";
import formatBody from "./Mustache";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import { verifyMessage } from "../services/WbotServices/wbotMessageListener";

interface Timers {
  [timeoutId: number]: NodeJS.Timeout
}

let timers: Timers = {};

export const SendAwayMessageInterval = async (
  wbot: Client,
  ticketId: number,
  msg: WbotMessage
) => {
  const ticket = await ShowTicketService(ticketId);
  const { contact, queue } = ticket;

  if (queue && ticket.status !== "closed" && msg.fromMe && !timers[contact.id] && queue.seconds > 0) {
    timers[contact.id] = setTimeout(async () => {
      const chatId = `${contact.number}@c.us`;
      const body = formatBody(`\u200e${queue.awayMessage}`, contact);
      const sentMessage = await wbot.sendMessage(chatId, body);
      verifyMessage(sentMessage, ticket, contact);
    }, queue.seconds * 1000);
  }
};

export const ResetResponseTimer = async (
  ticket: Ticket,
  msg: WbotMessage
) => {
  const { contact } = ticket;

  if (!msg.fromMe && timers[contact.id]) {
    clearTimeout(timers[contact.id]);
  }
};