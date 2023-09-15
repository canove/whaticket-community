import Ticket from "../models/Ticket";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

export const SendAwayMessageInterval = async (
  message: string,
  ticket: Ticket,
  timeInput: number
) => {
  const lastMessage = ticket.messages[-1];
  const seconds = timeInput * 1000;
  const timeoutId = setTimeout(async () => {
    if (ticket.status === "open" && lastMessage.fromMe && timeInput > 0) {
      const now = new Date().getTime();
      const sentAt = new Date(lastMessage.createdAt).getTime();
      const timeElapsed = now - sentAt;
      if (timeElapsed > seconds) {
        await SendWhatsAppMessage({ body: message, ticket });
      }
    }
  }, seconds);
  if (!lastMessage.fromMe) {
    clearTimeout(timeoutId);
  }
};
