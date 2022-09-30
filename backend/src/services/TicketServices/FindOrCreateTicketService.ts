import { subHours } from "date-fns";
import { Op } from "sequelize";
import Contact from "../../database/models/Contact";
import Ticket from "../../database/models/Ticket";
import ShowTicketService from "./ShowTicketService";

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  companyId: number,
  unreadMessages: number,
  groupContact?: Contact,
  isDispatcher?: boolean
): Promise<Ticket> => {
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending", "dispatcher"]
      },
      whatsappId,
      contactId: groupContact ? groupContact.id : contact.id,
      companyId
    }
  });

  if (ticket) {
    await ticket.update({ unreadMessages });
    if (ticket.status === "dispatcher" && !isDispatcher) {
      await ticket.update({ status: "pending" });
    }
  }

  if (!ticket && groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id,
        companyId
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: isDispatcher === true ? "dispatcher" : "pending",
        userId: null,
        unreadMessages
      });
    }
  }

  if (!ticket && !groupContact) {
    ticket = await Ticket.findOne({
      where: {
        updatedAt: {
          [Op.between]: [+subHours(new Date(), 2), +new Date()]
        },
        whatsappId,
        contactId: contact.id,
        companyId
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: isDispatcher === true ? "dispatcher" : "pending",
        userId: null,
        unreadMessages
      });
    }
  }

  if (!ticket) {
    ticket = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: isDispatcher === true ? "dispatcher" : "pending",
      isGroup: !!groupContact,
      unreadMessages,
      whatsappId,
      companyId
    });
  }

  ticket = await ShowTicketService(ticket.id);

  return ticket;
};

export default FindOrCreateTicketService;
