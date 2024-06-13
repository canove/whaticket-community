import { Request, Response } from "express";

import { parseISO } from "date-fns";
import formatBody from "../helpers/Mustache";
import { getWbot } from "../libs/wbot";
import Message from "../models/Message";
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
};

interface TicketData {
  contactId: number;
  status: string;
  queueId: number;
  userId: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    withUnreadMessages
  } = req.query as IndexQuery;

  const userId = req.user.id;

  let queueIds: number[] = [];

  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }

  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    userId,
    queueIds,
    withUnreadMessages
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

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const ticketData: TicketData = req.body;

  const { ticket } = await UpdateTicketService({
    ticketData,
    ticketId
  });

  if (ticket.status === "closed") {
    const whatsapp = await ShowWhatsAppService(ticket.whatsappId);

    const { farewellMessage } = whatsapp;

    if (farewellMessage) {
      await SendWhatsAppMessage({
        body: formatBody(farewellMessage, ticket.contact),
        ticket
      });
    }
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

  const ticketMessages = await ticketChat.fetchMessages({ limit: 500 });

  console.log("se van a recuperar: ", ticketMessages.length, "mensajes");

  if (ticketMessages && ticketMessages.length > 0) {
    await Message.destroy({ where: { ticketId, isPrivate: false } });

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
