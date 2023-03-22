import { subHours } from "date-fns";
import { Op } from "sequelize";
import Contact from "../../database/models/Contact";
import Queue from "../../database/models/Queue";
import Ticket from "../../database/models/Ticket";
import Whatsapp from "../../database/models/Whatsapp";
import CreateTicketHistoricService from "../TicketHistoricsServices/CreateTicketHistoricService";
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
    console.log("update ticket findOrCreateticketService 28");
    await ticket.update({ unreadMessages });
    if (!inBot && !isDispatcher && ticket.status != 'open') {
      console.log("update ticket findOrCreateticketService 31");
      await ticket.update({ status: "pending" });

      // TICKET HISTORIC - UPDATE
      await CreateTicketHistoricService(ticket, "UPDATE");
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
      console.log("update ticket findOrCreateticketService 46");
      await ticket.update({
        status: (isDispatcher === true ? "dispatcher" : inBot ? "inbot" : "pending"),
        userId: null,
        unreadMessages
      });

      // TICKET HISTORIC - UPDATE
      await CreateTicketHistoricService(ticket, "UPDATE");
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
      console.log("update ticket findOrCreateticketService 70");
      await ticket.update({
        status: (isDispatcher === true ? "dispatcher" : inBot ? "inbot" : "pending"),
        userId: null,
        unreadMessages
      });

      // TICKET HISTORIC - UPDATE
      await CreateTicketHistoricService(ticket, "UPDATE");
    }
  }

  if (!ticket) {
    const whatsapp = await Whatsapp.findOne({
      where: { id: whatsappId, deleted: false, companyId },
      include: [
        {
          model: Queue,
          as: "queues",
          attributes: ["id", "limit", "overflowQueueId", "companyId"],
        }
      ],
    });

    const queueId = await getQueueId(whatsapp);

    ticket = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: (isDispatcher === true ? "dispatcher" : inBot ? "inbot" : "pending"),
      isGroup: !!groupContact,
      unreadMessages,
      whatsappId,
      companyId,
      queueId,
    });

    // TICKET HISTORIC - CREATE
    await CreateTicketHistoricService(ticket, "CREATE");
  }

  ticket = await ShowTicketService(ticket.id, companyId);

  return ticket;
};

const getQueueId = async (whatsapp: Whatsapp) => {
  try {
    if (whatsapp && whatsapp.queues && whatsapp.queues.length > 0) {
      let selectedQueueId = null;
  
      for (const queue of whatsapp.queues) {
        selectedQueueId = await checkQueue(queue);

        if (selectedQueueId) break;
      }

      return selectedQueueId;
    }

    return null;
  } catch (err) {
    console.log(err);
  }

  return null;
}

const checkQueue = async (queue: Queue) => {
  if (!queue.limit) return queue.id;

  const ticketCount = await Ticket.count({
    where: {
      companyId: queue.companyId,
      queueId: queue.id,
      status: "pending",
    }
  });

  if (ticketCount < queue.limit) return queue.id;

  const overflowQueue = await Queue.findOne({
    where: { 
      id: queue.overflowQueueId, 
      companyId: queue.companyId,
    },
    attributes: ["id", "limit", "overflowQueueId", "companyId"]
  });

  const overflowQueueId = await checkQueue(overflowQueue);

  return overflowQueueId;
}

export default FindOrCreateTicketService;
