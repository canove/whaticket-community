import { subHours } from "date-fns";
import { Op } from "sequelize";
import Contact from "../../models/Contact.js";
import Ticket from "../../models/Ticket.js";
import ShowTicketService from "./ShowTicketService.js";
import { withRedisLock } from "../../helpers/withRedisLock.js";
import { invalidateTicketListCache } from "./ListTicketsService.js";

const doFindOrCreate = async (
  contact: Contact,
  whatsappId: number,
  unreadMessages: number,
  groupContact?: Contact
): Promise<Ticket> => {
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      contactId: groupContact ? groupContact.id : contact.id,
      whatsappId: whatsappId
    }
  });

  // unreadMessages is managed by handleWhatsappEvents via ticket.increment()
  // Do not overwrite it here

  if (!ticket && groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id,
        whatsappId: whatsappId
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages
      });
    }
  }

  if (!ticket && !groupContact) {
    ticket = await Ticket.findOne({
      where: {
        updatedAt: {
          [Op.between]: [+subHours(new Date(), 24), +new Date()]
        },
        contactId: contact.id,
        whatsappId: whatsappId
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages
      });
    }
  }

  if (!ticket) {
    ticket = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: "pending",
      isGroup: !!groupContact,
      unreadMessages,
      whatsappId
    } as any);

    // New ticket — evict list caches so agents see it immediately
    invalidateTicketListCache().catch(() => {});
  }

  return ShowTicketService(ticket.id);
};

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  unreadMessages: number,
  groupContact?: Contact
): Promise<Ticket> => {
  const contactId = groupContact ? groupContact.id : contact.id;
  const lockKey = `ticket:lock:${contactId}:${whatsappId}`;

  return withRedisLock(lockKey, () =>
    doFindOrCreate(contact, whatsappId, unreadMessages, groupContact)
  );
};

export default FindOrCreateTicketService;
