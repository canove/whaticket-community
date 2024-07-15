import { Request, Response } from "express";

import { parseISO } from "date-fns";
import { Op, Sequelize } from "sequelize";
import { GroupChat } from "whatsapp-web.js";
import AppError from "../errors/AppError";
import GetTicketWbot from "../helpers/GetTicketWbot";
import formatBody from "../helpers/Mustache";
import { getWbot } from "../libs/wbot";
import Contact from "../models/Contact";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import TicketLog from "../models/TicketLog";
import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import { handleMessageForSyncUnreadMessages } from "../services/WbotServices/wbotMessageListener";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  status: string;
  date: string;
  showAll: string;
  withUnreadMessages: string;
  queueIds: string;
  whatsappIds: string;
  typeIds: string;
  showOnlyMyGroups: string;
};

interface TicketData {
  contactId: number;
  status: string;
  queueId: number;
  userId: number;
}

interface TicketLogData {
  ticketId: number;
  userId?: number;
  newUserId?: number;
  logType: string;
  ticketStatus: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    searchParam,
    showAll,
    whatsappIds: whatsappIdsStringified,
    queueIds: queueIdsStringified,
    typeIds: typeIdsStringified,
    withUnreadMessages,
    showOnlyMyGroups: showOnlyMyGroupsStringified
  } = req.query as IndexQuery;

  const userId = req.user.id;

  let queueIds: number[] = [];
  let whatsappIds: number[] = [];
  let typeIds: string[] = [];
  let showOnlyMyGroups: boolean = false;

  if (typeIdsStringified) {
    typeIds = JSON.parse(typeIdsStringified);
  }

  if (whatsappIdsStringified) {
    whatsappIds = JSON.parse(whatsappIdsStringified);
  }

  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }

  if (showOnlyMyGroupsStringified) {
    showOnlyMyGroups = JSON.parse(showOnlyMyGroupsStringified);
  }

  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    userId,
    whatsappIds,
    queueIds,
    typeIds,
    withUnreadMessages,
    showOnlyMyGroups
  });

  return res.status(200).json({ tickets, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status, userId }: TicketData = req.body;

  const ticket = await CreateTicketService({ contactId, status, userId });

  /* const io = getIO();
  io.to(ticket.status).emit("ticket", {
    action: "update",
    ticket
  }); */
  // Define la URL a la que se va a enviar la solicitud
  const url = process.env.NODE_URL + "/toEmit";
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: [ticket.status],
      event: {
        name: "ticket",
        data: {
          action: "update",
          ticket
        }
      }
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log("Success:", data);
    })
    .catch(error => {
      console.error("Error:", error);
    });

  return res.status(200).json(ticket);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  const contact = await ShowTicketService(ticketId);

  return res.status(200).json(contact);
};

export const ShowParticipants = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;

  // console.log("--- ShowParticipants");

  const ticketInDb = await Ticket.findOne({
    where: {
      id: ticketId
    },
    include: ["contact"]
  });

  if (!ticketInDb) {
    throw new AppError("ERR_TICKET_NOT_FOUND");
  }

  // console.log("--- ShowParticipants 2");

  // Obtiene la información del servicio de WhatsApp
  const wbot = getWbot(ticketInDb.whatsappId);

  if (!wbot) {
    throw new Error("WhatsApp service not found");
  }

  // console.log("--- ShowParticipants 3");

  const chat = await wbot.getChatById(ticketInDb.contact.number + "@g.us");

  if (!chat) {
    throw new Error("Chat not found");
  }

  // console.log("--- ShowParticipants 4");

  const chatDetails = chat as GroupChat;

  // console.log("--- ShowParticipants chatDetails: ", chatDetails);

  const chatParticipants = chatDetails.participants;

  const chatParticipantsContacts = await Contact.findAll({
    where: {
      number: {
        [Op.in]: chatParticipants.map(participant => participant.id.user)
      }
    }
  });

  // chatParticipants.map(participant => participant.id.user)

  return res.status(200).json(chatParticipantsContacts);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // console.log("--- ticket update");

  const { ticketId } = req.params;

  let withFarewellMessage = true;
  let leftGroup = false;

  if ("withFarewellMessage" in req.body) {
    withFarewellMessage = req.body.withFarewellMessage;

    delete req.body.withFarewellMessage;
  }

  if ("leftGroup" in req.body) {
    leftGroup = req.body.leftGroup;

    delete req.body.leftGroup;
  }

  const ticketData: TicketData = req.body;

  // console.log("ticketData", ticketData);
  // console.log({ withFarewellMessage });

  const { ticket } = await UpdateTicketService({
    ticketData,
    ticketId
  });

  if (ticket.status === "closed" && !ticket.isGroup && withFarewellMessage) {
    const whatsapp = await ShowWhatsAppService(ticket.whatsappId);

    const { farewellMessage } = whatsapp;

    if (farewellMessage) {
      await SendWhatsAppMessage({
        body: formatBody(farewellMessage, ticket.contact),
        ticket
      });
    }
  }

  if (ticket.status === "closed" && ticket.isGroup && leftGroup) {
    const wbot = await GetTicketWbot(ticket);

    const wbotChat = await wbot.getChatById(
      `${ticket.contact?.number}@${ticket.isGroup ? "g" : "c"}.us`
    );

    const wbotGroupChat = wbotChat as GroupChat;

    await wbotGroupChat.leave();
  }

  return res.status(200).json(ticket);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;

  const ticket = await DeleteTicketService(ticketId);

  /* const io = getIO();
  io.to(ticket.status).to(ticketId).to("notification").emit("ticket", {
    action: "delete",
    ticketId: +ticketId
  }); */
  // Define la URL a la que se va a enviar la solicitud
  const url = process.env.NODE_URL + "/toEmit";
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: [ticket.status],
      event: {
        name: "ticket",
        data: {
          action: "delete",
          ticketId: +ticketId
        }
      }
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log("Success:", data);
    })
    .catch(error => {
      console.error("Error:", error);
    });

  return res.status(200).json({ message: "ticket deleted" });
};

export const recoverAllMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;

  const ticket = await ShowTicketService(ticketId);

  const whatsapp = await ShowWhatsAppService(ticket.whatsappId);

  const wbot = getWbot(whatsapp.id);

  const ticketChat = await wbot.getChatById(
    `${ticket.contact.number}${ticket.contact.isGroup ? "@g.us" : "@c.us"}`
  );

  const ticketMessages = await ticketChat.fetchMessages({ limit: 100000 });

  console.log("se van a recuperar: ", ticketMessages.length, "mensajes");

  if (ticketMessages && ticketMessages.length > 0) {
    console.log("se eliminan los mensajes del ticket:", ticketId);

    await Message.destroy({
      where: {
        ticketId,
        isPrivate: {
          [Op.or]: [false, null]
        }
      }
    });

    const privateMessages = await Message.findAll({
      where: {
        ticketId,
        isPrivate: true
      }
    });

    await Promise.all(
      privateMessages.map(async message => {
        try {
          const timestamp = parseISO(message.createdAt.toISOString()).getTime();
          await message.update({ timestamp: Math.floor(timestamp / 1000) });
        } catch (error) {
          console.log(error);
        }
      })
    );

    const BATCH_SIZE = 30;

    for (let i = 0; i < ticketMessages.length; i += BATCH_SIZE) {
      const batch = ticketMessages.slice(i, i + BATCH_SIZE);

      const updatePromises = batch.map(async message => {
        try {
          await handleMessageForSyncUnreadMessages(
            message,
            wbot,
            ticketChat,
            false
          );
        } catch (error) {
          console.error(`Error actualizando el mensaje ${message}:`, error);
        }
      });
      await Promise.all(updatePromises);
    }
  }

  console.log("se recuperaron los mensajes");

  return res.status(200).json({ message: "success" });
};

export const showAllRelatedTickets = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;

  const ticket = await ShowTicketService(ticketId);

  const relatedTickets = await Ticket.findAll({
    where: {
      whatsappId: ticket.whatsappId,
      contactId: ticket.contactId
    },
    order: [["lastMessageTimestamp", "ASC"]],
    include: [
      {
        model: Message,
        as: "messages",
        order: [["timestamp", "ASC"]],
        where: {
          timestamp: {
            [Op.gte]: Sequelize.literal(
              `(SELECT UNIX_TIMESTAMP(Tickets.createdAt) FROM Tickets WHERE Tickets.id = ticketId)`
            )
          }
        },
        limit: 1,
        required: false
      }
    ]
  });

  if (!relatedTickets || relatedTickets.length === 0) {
    throw new AppError("ERR_NO_TICKET_relateds_FOUND", 404);
  }

  return res.status(200).json(relatedTickets);
};

export const createTicketLog = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const ticketLog: TicketLogData = req.body;

  try {
    const newTicketLog = await TicketLog.create(ticketLog);

    if (!newTicketLog) {
      console.log("error");

      throw new AppError("ERR_TICKET_NOT_FOUND");
    }
  } catch (error) {
    console.log("error", error);

    throw new AppError("ERR_TICKET_NOT_FOUND");
  }

  return res.status(200).json({});
};
