import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../database/models/Ticket";
import ShowContactService from "../ContactServices/ShowContactService";
import UpdateTicketService from "./UpdateTicketService";
import CreateTicketHistoricService from "../TicketHistoricsServices/CreateTicketHistoricService";
import FileRegister from "../../database/models/FileRegister";
import Queue from "../../database/models/Queue";
import SendOfficialTemplateMessage from "./SendOfficialTemplateMessage";
import CreateMessageService from "../MessageServices/CreateMessageService";
import OfficialTemplates from "../../database/models/OfficialTemplates";

interface Request {
  contactId: number;
  status: string;
  userId: number;
  companyId: number;
  ticketId: number;
  queueId?: string | number;
  whatsappId?: string;
  official?: boolean;
  templateId?: string; 
  templateVariables?: string; 
  templateHeader?: string;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  companyId,
  ticketId,
  queueId = null,
  whatsappId, 
  official, 
  templateId, 
  templateVariables, 
  templateHeader,
}: Request): Promise<Ticket> => {
  const defaultWhatsapp = await GetDefaultWhatsApp({ companyId, whatsappId, official, queueId });

  let msgId = null;

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

    if (official === true) {
      const { data } = await SendOfficialTemplateMessage({
        whatsapp: defaultWhatsapp,
        to: number,
        templateId,
        templateVariables,
        templateHeader,
      });

      msgId = (data.messages && data.messages.length > 0) ? data.messages[0].id : null;
    }

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

  await CheckContactOpenTickets(contactId, companyId);

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

  if (official === true && msgId) {
    const template = await OfficialTemplates.findOne({
      where: { id: templateId }
    });

    let body = template.body;
    
    const variables = JSON.parse(templateVariables);
    if (variables && Object.keys(variables).length > 0) {
      for (const key of Object.keys(variables)) {
        body = body.replace(key, variables[key]);
      }
    }

    const messageData = {
      id: msgId,
      ticketId: ticket.id,
      contactId: contactId,
      body: body,
      fromMe: true,
      read: true,
      mediaUrl: null,
      mediaType: null,
      quotedMsgId: null,
      companyId,
      userId: ticket.userId ? ticket.userId : null
    };

    await ticket.update({ lastMessage: body, lastMessageFromMe: true });

    await CreateMessageService({ messageData });
  }

  // TICKET HISTORIC - CREATE
  await CreateTicketHistoricService(ticket, "CREATE");

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  return ticket;
};

export default CreateTicketService;
