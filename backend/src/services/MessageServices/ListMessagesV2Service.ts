import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface Request {
  ticketsToFetchMessagesQueue: string;
  searchMessageId?: string;
  pageNumber?: string;
}

interface Response {
  messages: Message[];
  ticketsToFetchMessagesQueue: TicketsToFetchMessages[];
  hasMore: boolean;
}

interface TicketsToFetchMessages {
  ticketId: number;
  pageNumber: string;
  ticket?: Ticket;
}

// Servicio principal para listar mensajes
const ListMessagesV2Service = async ({
  ticketsToFetchMessagesQueue: ticketsToFetchMessagesQueueString,
  searchMessageId
}: Request): Promise<Response> => {
  console.log("mensaje a encontrar:", searchMessageId);

  // Parsear la cola de tickets a un objeto JSON
  const ticketsToFetchMessagesQueue: TicketsToFetchMessages[] = JSON.parse(
    ticketsToFetchMessagesQueueString
  );

  // Obtener mensajes iniciales y la cola de tickets actualizada
  let {
    messages,
    ticketsToFetchMessagesQueue: nextTicketsToFetchMessagesQueue,
    hasMore
  } = await fetchMessages(ticketsToFetchMessagesQueue);

  // Bucle para buscar un mensaje específico si es necesario
  // o para dar otra vuelta si en la primera se recolectaron pocos mensajes
  while (
    (searchMessageId &&
      hasMore &&
      !messages.find(msg => msg.id === searchMessageId)) ||
    (messages.length < 20 &&
      ticketsToFetchMessagesQueue.length === 2 &&
      +ticketsToFetchMessagesQueue[0].pageNumber === 1 &&
      +ticketsToFetchMessagesQueue[1].pageNumber === 0)
  ) {
    console.log("____________________ListMessagesV2Service");

    // Incrementar el número de página del último ticket en la cola
    nextTicketsToFetchMessagesQueue = incrementPageNumber(
      nextTicketsToFetchMessagesQueue
    );

    // Obtener más mensajes y actualizar la cola de tickets
    const fetchResult = await fetchMessages(nextTicketsToFetchMessagesQueue);
    messages.push(...fetchResult.messages);
    nextTicketsToFetchMessagesQueue = fetchResult.ticketsToFetchMessagesQueue;
    hasMore = fetchResult.hasMore;
  }

  console.log(
    "se encontró el mensaje???",
    messages.find(msg => msg.id === searchMessageId)
  );

  // Devolver los mensajes encontrados, la cola de tickets y si hay más mensajes por buscar
  return {
    messages: messages.reverse(),
    ticketsToFetchMessagesQueue: nextTicketsToFetchMessagesQueue,
    hasMore
  };
};

// Función para obtener mensajes de la cola de tickets
const fetchMessages = async (
  ticketsToFetchMessagesQueue: TicketsToFetchMessages[]
): Promise<Response> => {
  const lastTicketToFetchMessages =
    ticketsToFetchMessagesQueue[ticketsToFetchMessagesQueue.length - 1];
  const ticket = await ShowTicketService(lastTicketToFetchMessages.ticketId);

  // Validar si el ticket existe
  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  lastTicketToFetchMessages.ticket = ticket;

  // Obtener mensajes del ticket
  let { messages, hasMore } = await getMessagesForTicket(
    lastTicketToFetchMessages
  );

  // Si no hay más mensajes, buscar el siguiente ticket cerrado
  if (!hasMore) {
    const nextTicket = await findNextClosedTicket(lastTicketToFetchMessages);
    if (nextTicket) {
      ticketsToFetchMessagesQueue.push({
        ticketId: nextTicket.id,
        pageNumber: "0"
      });
      hasMore = true;
    }
  }

  return {
    messages,
    ticketsToFetchMessagesQueue,
    hasMore
  };
};

// Función para obtener mensajes de un ticket específico
const getMessagesForTicket = async (
  ticketToFetchMessages: TicketsToFetchMessages
) => {
  const limit = 20;
  const offset = limit * (+ticketToFetchMessages.pageNumber - 1);

  // Obtener todos los mensajes del ticket
  const ticketMessages = await Message.findAll({
    where: { ticketId: ticketToFetchMessages.ticketId },
    attributes: ["id", "timestamp"]
  });

  // Determinar la propiedad de ordenación (timestamp o createdAt)
  const orderProp = ticketMessages.some(msg => !msg.timestamp)
    ? "createdAt"
    : "timestamp";

  let relatedTickets: number | null = null;

  if (ticketToFetchMessages.ticket) {
    relatedTickets = await Ticket.count({
      where: {
        whatsappId: ticketToFetchMessages.ticket.whatsappId,
        contactId: ticketToFetchMessages.ticket.contactId
      }
    });

    console.log("relatedTickets at getMessagesForTicket", relatedTickets);
  }

  // Buscar y contar mensajes con la propiedad de ordenación adecuada
  const { count, rows: messages } = await Message.findAndCountAll({
    where: {
      ticketId: ticketToFetchMessages.ticketId,
      ...(relatedTickets > 1 && {
        timestamp: {
          [Op.gte]:
            Math.floor(
              new Date(ticketToFetchMessages.ticket?.createdAt!).getTime() /
                1000
            ) - 28800 // 8 horas en segundos por si acaso el server se cayo por tiempo prolognado
        }
      })
    },
    limit,
    offset,
    order: [[orderProp, "DESC"]],
    include: [
      "contact",
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ]
  });

  const hasMore = count > offset + messages.length;
  return { messages, hasMore };
};

// Función para encontrar el siguiente ticket cerrado
const findNextClosedTicket = async (lastTicket: TicketsToFetchMessages) => {
  if (!lastTicket.ticket) {
    return null;
  }

  const nextTicket = await Ticket.findOne({
    where: {
      id: { [Op.lt]: lastTicket.ticketId },
      status: "closed",
      whatsappId: lastTicket.ticket.whatsappId,
      contactId: lastTicket.ticket.contactId
    },
    order: [["id", "DESC"]]
  });
  return nextTicket;
};

// Función para incrementar el número de página del último ticket en la cola
const incrementPageNumber = (
  queue: TicketsToFetchMessages[]
): TicketsToFetchMessages[] => {
  queue[queue.length - 1].pageNumber = (
    +queue[queue.length - 1].pageNumber + 1
  ).toString();
  return queue;
};

export default ListMessagesV2Service;
