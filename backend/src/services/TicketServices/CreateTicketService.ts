import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../database/models/Ticket";
import ShowContactService from "../ContactServices/ShowContactService";
import UpdateTicketService from "./UpdateTicketService";
import CreateTicketHistoricService from "../TicketHistoricsServices/CreateTicketHistoricService";
import FileRegister from "../../database/models/FileRegister";
import Queue from "../../database/models/Queue";

interface Request {
  contactId: number;
  status: string;
  userId: number;
  companyId: number;
  ticketId: number;
  queueId?: string | number;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  companyId,
  ticketId,
  queueId = null,
}: Request): Promise<Ticket> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId);

  if (ticketId) {
    const { ticket } = await UpdateTicketService({ 
      ticketData: {
        status: "closed",
        userId: userId || null,
        categoryId: null
      }, 
      ticketId, 
      companyId 
    });

    queueId = ticket.queueId;
  } else {
    const { name, number } = await ShowContactService(contactId);

    await FileRegister.create({
      name,
      companyId,
      haveWhatsapp: true,
      phoneNumber: number,
      whatsappId: defaultWhatsapp.id,
      readAt: new Date(),
      sentAt: new Date(),
      processedAt: new Date(),
      deliveredAt: new Date(),
      interactionAt: new Date(),
    });
  }

  await CheckContactOpenTickets(contactId);

  const { isGroup } = await ShowContactService(contactId);

  const { id }: Ticket = await defaultWhatsapp.$create("ticket", {
    contactId,
    status,
    isGroup,
    userId,
    companyId,
    queueId,
  });

  const ticket = await Ticket.findByPk(id, { 
    include: [
      "contact",
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      }
    ] 
  });

  // TICKET HISTORIC - CREATE
  await CreateTicketHistoricService(ticket, "CREATE");

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  return ticket;
};

export default CreateTicketService;
