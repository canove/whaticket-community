import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../database/models/Ticket";
import ShowContactService from "../ContactServices/ShowContactService";
import UpdateTicketService from "./UpdateTicketService";
import CreateTicketHistoricService from "../TicketHistoricsServices/CreateTicketHistoricService";

interface Request {
  contactId: number;
  status: string;
  userId: number;
  companyId: number;
  ticketId: number;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  companyId,
  ticketId
}: Request): Promise<Ticket> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId);

  if (ticketId) {
    await UpdateTicketService({ 
      ticketData: {
        status: "closed",
        userId: userId || null,
        categoryId: null
      }, 
      ticketId, 
      companyId 
    });
  }

  await CheckContactOpenTickets(contactId);

  const { isGroup } = await ShowContactService(contactId);

  const { id }: Ticket = await defaultWhatsapp.$create("ticket", {
    contactId,
    status,
    isGroup,
    userId,
    companyId
  });

  const ticket = await Ticket.findByPk(id, { include: ["contact"] });

  // TICKET HISTORIC - CREATE
  await CreateTicketHistoricService(ticket, "CREATE");

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  return ticket;
};

export default CreateTicketService;
