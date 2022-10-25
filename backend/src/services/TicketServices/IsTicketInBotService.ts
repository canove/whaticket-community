/*eslint-disable */
import AppError from "../../errors/AppError";
import Ticket from "../../database/models/Ticket";
import Message from "../../database/models/Message";
import Whatsapp from "../../database/models/Whatsapp";
import Contact from "../../database/models/Contact";
import { preparePhoneNumber9Digit } from "../../utils/common";
import { Op } from "sequelize";

export const IsTicketInBotService = async (messageId: string): Promise<boolean> => {
  const message = await Message.findByPk(messageId);

  if (!message) {
    throw new AppError("ERR_MESSAGE_DO_NOT_EXISTS");
  }

  const ticket = await Ticket.findByPk(message.ticketId);

  if (!ticket) {
    throw new AppError("ERR_TICKET_DO_NOT_EXISTS");
  }

  if (ticket.status === "inbot") {
    return true;
  }

  return false;
};

export const IsTicketInBotPostService = async (session: string, contactNumber: string): Promise<boolean> => {
  const connnection = await Whatsapp.findOne({
    where: {
      name: session,
      deleted: 0
     }});

  if (!connnection) {
    return true;
  }


  const contact = await Contact.findOne({
    where: {
      number: preparePhoneNumber9Digit(contactNumber),
      companyId: connnection.companyId
   }});

   if (!contact) {
    return true;
  }

  const ticket = await Ticket.findAll({
    where: {
      whatsappId: connnection.id,
      contactId: contact.id
   }});

  if (ticket.length == 0) {
    return true;
  }

  switch (ticket[ticket.length-1].status) {
    case "open":
    case "pending":
    case "dispatcher":
      return false;
    default:
      return true;
  }
};


export default { IsTicketInBotService, IsTicketInBotPostService };
