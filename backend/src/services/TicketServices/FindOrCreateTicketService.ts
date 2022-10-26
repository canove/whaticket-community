import { subHours } from "date-fns";
import { Op } from "sequelize";
import Contact from "../../database/models/Contact";
import Ticket from "../../database/models/Ticket";
import ShowTicketService from "./ShowTicketService";
/*eslint-disable */
const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  companyId: number,
  unreadMessages: number,
  groupContact?: Contact,
  isDispatcher?: boolean,
  inBot?: boolean
): Promise<Ticket> => {
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending", "dispatcher", "inbot"]
      },
      whatsappId,
      contactId: groupContact ? groupContact.id : contact.id,
      companyId
    }
  });

  if (ticket) {
    await ticket.update({ unreadMessages });
    if (!inBot && !isDispatcher && ticket.status != 'open') {
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
        status: (isDispatcher === true ? "dispatcher" : inBot ? "inbot" : "pending"),
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
        companyId,
        status: { [Op.ne]: "closed" }
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: (isDispatcher === true ? "dispatcher" : inBot ? "inbot" : "pending"),
        userId: null,
        unreadMessages
      });
    }
  }

  if (!ticket) {
    ticket = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: (isDispatcher === true ? "dispatcher" : inBot ? "inbot" : "pending"),
      isGroup: !!groupContact,
      unreadMessages,
      whatsappId,
      companyId
    });
  }

  ticket = await ShowTicketService(ticket.id, companyId);

  return ticket;
};

export default FindOrCreateTicketService;
