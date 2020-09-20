import AppError from "../../errors/AppError";
import GetDefaultWhatsapp from "../../helpers/GetDefaultWhatsapp";
import Ticket from "../../models/Ticket";

interface Request {
  contactId: number;
  status?: string;
}

const CreateTicketService = async ({
  contactId,
  status
}: Request): Promise<Ticket> => {
  const defaultWhatsapp = await GetDefaultWhatsapp();

  if (!defaultWhatsapp) {
    throw new AppError("No default WhatsApp found. Check Connection page.");
  }

  const { id } = await defaultWhatsapp.$create("ticket", {
    contactId,
    status
  });

  const ticket = await Ticket.findByPk(id, { include: ["contact"] });

  if (!ticket) {
    throw new AppError("Error, ticket not created.");
  }

  return ticket;
};

export default CreateTicketService;
