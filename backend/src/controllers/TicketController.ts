/*eslint-disable*/
import { Op } from "sequelize";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import formatBody from "../helpers/Mustache";
import HistoricService from "../services/TicketServices/HistoricService";
import ResolveService from "../services/TicketServices/ResolveService";
import ChangeQueueOrResolveTicketService from "../services/TicketServices/ChangeQueueOrResolveTicket";
import { IsTicketInBotService, IsTicketInBotPostService} from "../services/TicketServices/IsTicketInBotService";
import AverageService from "../services/TicketServices/AverageService";
import Whatsapp from "../database/models/Whatsapp";
import Contact from "../database/models/Contact";
import {
  isValidHttpUrl,
  preparePhoneNumber9Digit,
  removePhoneNumber9Digit,
  removePhoneNumber9DigitCountry,
  removePhoneNumberCountry,
  removePhoneNumberWith9Country
} from "../utils/common";
import Ticket from "../database/models/Ticket";
import CheckProfilePermissionService from "../services/ProfileServices/CheckProfilePermissionService";
import ShowUserService from "../services/UserServices/ShowUserService";
import ListAllTicketsService from "../services/TicketServices/ListAllTicketsService";
import SatisfactionSurveyResponses from "../database/models/SatisfactionSurveyResponses";
import ShowSatisfactionSurveyService from "../services/SatisfactionSurveyService/ShowSatisfactionSurveyService";
import AppError from "../errors/AppError";
import ConnectionFiles from "../database/models/ConnectionFile";
import SendTicketMessagesToCompanyService from "../services/TicketServices/SendTicketMessagesToCompanyService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  status: string;
  date: string;
  showAll: string;
  withUnreadMessages: string;
  queueIds: string;
  phone: string,
  session: string
  categoryId: string;
  connectionFileId: string;
  pendingAnswer: string;
  isTask: string;
  searchTask: string;
  taskFilter: string;
};

interface TicketData {
  ticketId: number;
  contactId: number;
  status: string;
  queueId: number;
  userId: number;
  categoryId: number;
  createdAt: Date;
  finalizedAt: Date;
  observation: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    withUnreadMessages,
    categoryId,
    connectionFileId,
    pendingAnswer,
    isTask,
    searchTask,
    taskFilter,
  } = req.query as IndexQuery;

  const userId = req.user.id;
  const { companyId, id } = req.user;

  let queueIds = [];

  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }

  if (queueIds.length === 0) {
    queueIds = ["NO_QUEUE"];
  }

  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    userId,
    queueIds,
    withUnreadMessages,
    companyId,
    categoryId,
    connectionFileId,
    loggedUserId: id,
    pendingAnswer,
    isTask: isTask === "true" ? true : false,
    searchTask,
    taskFilter,
  });

  return res.status(200).json({ tickets, count, hasMore });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const { tickets } = await ListAllTicketsService({ companyId });

  return res.status(200).json({ tickets });
};

export const containTicket = async (req: Request, res: Response): Promise<Response> => {
  const { phone, session } = req.query as IndexQuery;

    let whatsapp = await Whatsapp.findOne({
      where:{
        name: session
      },
      order: [["createdAt", "DESC"]],
    })

    if (!whatsapp) {
      whatsapp = await Whatsapp.findOne({
        where:{
          name: session,
          official: true
        }
      });
    }

    const contact = await Contact.findOne({
      where: {
        companyId: whatsapp.companyId,
        number: 
          { 
            [Op.or]: [
              removePhoneNumberWith9Country(phone),
              preparePhoneNumber9Digit(phone),
              removePhoneNumber9Digit(phone),
              removePhoneNumberCountry(phone),
              removePhoneNumber9DigitCountry(phone)
            ],
          }
     }});

     if (!contact) {
      return res.status(200).json(null);
     }

     const ticket = await Ticket.findOne({
      where: {
        contactId: contact.id,
        companyId: whatsapp.companyId,
        status: {
          [Op.or]: [
            "pending",
            "open"
          ]
        }
      }
     });

  return res.status(200).json(ticket);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status, userId, ticketId, queueId }: TicketData = req.body;
  const { whatsappId, official, templateId, templateVariables, templateHeader } = req.body;
  const { companyId } = req.user;

  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    companyId,
    ticketId,
    queueId,
    whatsappId, 
    official, 
    templateId, 
    templateVariables, 
    templateHeader
  });

  const io = getIO();
  io.to(ticket.status).emit(`ticket${companyId}`, {
    action: "update",
    ticket
  });

  return res.status(200).json(ticket);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  const loggedUserId = req.user.id;
  const allTickets = await CheckProfilePermissionService({ userId: loggedUserId , companyId, permission: "tickets-manager:showall" });

  let userQueueIds = null;

  if (!allTickets) {
    const user = await ShowUserService(loggedUserId, companyId);
    userQueueIds = user.queues.map(queue => queue.id);
  }

  const ticket = await ShowTicketService(ticketId, companyId, userQueueIds);

  return res.status(200).json(ticket);
};

export const historic = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  const contact = await HistoricService(contactId, companyId);

  return res.status(200).json(contact);
};

export const resolve = async (req: Request, res: Response): Promise<Response> => {
  const { categoryId } = req.params;

  const category = await ResolveService(categoryId);

  return res.status(200).json(category);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId, id: userId } = req.user;
  const ticketData: TicketData = req.body;
  const { surveyId, categoryId } = req.body;

  const { ticket } = await UpdateTicketService({
    ticketData,
    ticketId,
    companyId,
    loggedInUserId: userId,
  });

  if (ticket.status === "closed") {
    await SendTicketMessagesToCompanyService({ ticket, categoryId, companyId });

    const connectionFile = await ConnectionFiles.findOne({
      where: { companyId },
      include: [
        {
          model: Whatsapp,
          as: "whatsapps",
          attributes: ["id"],
          where: { id: ticket.whatsappId },
          required: true,
        }
      ],
    });

    if (connectionFile && connectionFile.farewellMessage) {
      await SendWhatsAppMessage({
        body: connectionFile.farewellMessage,
        ticket: ticket,
        companyId,
        fromMe: true,
        bot: true,
        contactId: ticket.contactId,
        whatsMsgId: null,
        cation: null,
        type: "text",
        mediaUrl: null,
        templateButtons: null
      });

      await ticket.update({ lastMessage: connectionFile.farewellMessage, lastMessageFromMe: true });
    }
  }

  if (ticket.status === "closed" && surveyId) {
    const whatsapp = await ShowWhatsAppService(ticket.whatsappId, companyId);

    const { official } = whatsapp;

    if (official) {
      console.log("Whatsapp Official -> Pesquisa de Satisfação Não Enviada para Ticket " + ticketId);
    } else {
      const satisfactionSurvey = await ShowSatisfactionSurveyService(surveyId, companyId);

      await SatisfactionSurveyResponses.create({
        satisfactionSurveyId: surveyId,
        ticketId: ticketId,
        userId: userId,
        contactId: ticket.contactId,
        companyId: companyId
      });

      const answers = JSON.parse(satisfactionSurvey.answers);

      const templateButtons = {
        text: satisfactionSurvey.message,
        footer: "",
        templateButtons: answers.map((answer: string, index: number) => {
          const button = {
            index: index + 1,
            quickReplyButton: {
              displayText: answer,
              id: `ANSWER-${index + 1}`
            }
          };

          return button;
        })
      };

      await SendWhatsAppMessage({
        body: null,
        ticket: ticket,
        companyId,
        fromMe: true,
        bot: true,
        contactId: ticket.contactId,
        whatsMsgId: null,
        cation: null,
        type: "buttons",
        mediaUrl: null,
        templateButtons
      });
    }
  }

  return res.status(200).json(ticket);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId, profile } = req.user;

  if (profile !== 1 || companyId !== 1) throw new AppError("NO_PERMISSION");

  const ticket = await DeleteTicketService(ticketId);

  const io = getIO();
  io.to(ticket.status)
    .to(ticketId)
    .to("notification")
    .emit(`ticket${ticket.companyId}`, {
      action: "delete",
      ticketId: +ticketId
    });

  return res.status(200).json({ message: "ticket deleted" });
};

export const changeQueueOrResolve = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId, queueName } = req.body;

  const ticket = await ChangeQueueOrResolveTicketService({
    messageId,
    queueName
  });

  const io = getIO();
  io.to(ticket.status)
    .to("notification")
    .to(ticket.id.toString())
    .emit(`ticket${ticket.companyId}`, {
      action: "update",
      ticket
    });

  return res.status(200).json({ message: "Ticket atualizado com sucesso!" });
};

export const isInBot = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const isTicketInBot = await IsTicketInBotService(messageId);

  return res.status(200).json(isTicketInBot);
};

export const isInBotPost = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { session, contactNumber } = req.body;

  const isTicketInBot = await IsTicketInBotPostService(session, contactNumber);

  return res.status(200).json(isTicketInBot);
};

export const average = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { averageTimes, totalAverageTime } = await AverageService(
    searchParam,
    companyId,
  );

  return res.status(200).json({ averageTimes, totalAverageTime });
};
