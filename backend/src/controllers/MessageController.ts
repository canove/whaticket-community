import { Request, Response } from "express";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import Message from "../models/Message";

// import ListMessages2Service from "../services/MessageServices/ListMessages2Service";
import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ListMessagesV2Service from "../services/MessageServices/ListMessagesV2Service";
import SearchMessagesService from "../services/MessageServices/SearchMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import verifyPrivateMessage from "../utils/verifyPrivateMessage";

type searchQuery = {
  searchParam: string;
  pageNumber: string;
};

type IndexQuery = {
  pageNumber: string;
  setTicketMessagesAsRead?: string;
};

type IndexQueryV2 = {
  setTicketMessagesAsRead?: string;
  searchMessageId?: string;
  ticketsToFetchMessagesQueue: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

export const search = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as unknown as searchQuery;

  const { count, messages, hasMore } = await SearchMessagesService({
    searchParam,
    pageNumber
  });

  return res.json({ count, messages, hasMore });
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  const { pageNumber, setTicketMessagesAsRead } =
    req.query as unknown as IndexQuery;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId
  });

  if (setTicketMessagesAsRead === "true") {
    SetTicketMessagesAsRead(ticket);
  }

  return res.json({ count, messages, ticket, hasMore });
};

export const indexV2 = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    setTicketMessagesAsRead,
    ticketsToFetchMessagesQueue,
    searchMessageId
  } = req.query as unknown as IndexQueryV2;

  // console.log("_________index2:", {
  //   setTicketMessagesAsRead,
  //   ticketsToFetchMessagesQueue
  // });

  const {
    messages,
    ticketsToFetchMessagesQueue: nextTicketsToFetchMessagesQueue,
    hasMore
  } = await ListMessagesV2Service({
    ticketsToFetchMessagesQueue,
    searchMessageId
  });

  if (setTicketMessagesAsRead === "true") {
    if (nextTicketsToFetchMessagesQueue[0].ticket) {
      console.log("_________index2 SetTicketMessagesAsRead: ");
      SetTicketMessagesAsRead(nextTicketsToFetchMessagesQueue[0].ticket);
    }
  }

  return res.json({ messages, nextTicketsToFetchMessagesQueue, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  const ticket = await ShowTicketService(ticketId);

  SetTicketMessagesAsRead(ticket);

  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppMedia({ media, ticket });
      })
    );
  } else {
    await SendWhatsAppMessage({ body, ticket, quotedMsg });
  }

  ticket.update({ userHadContact: true });

  return res.send();
};

export const storePrivate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { body }: MessageData = req.body;

  const ticket = await ShowTicketService(ticketId);

  verifyPrivateMessage(body, ticket, ticket.contact);

  return res.send();
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const message = await DeleteWhatsAppMessage(messageId);

  /* const io = getIO();
  io.to(message.ticketId.toString()).emit("appMessage", {
    action: "update",
    message
  }); */
  // Define la URL a la que se va a enviar la solicitud
  const url = process.env.NODE_URL + "/toEmit";
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: [message.ticketId.toString()],
      event: {
        name: "appMessage",
        data: {
          action: "update",
          message
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

  return res.send();
};
