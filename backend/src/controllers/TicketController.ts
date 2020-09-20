import { Request, Response } from "express";
import GetDefaultWhatsapp from "../helpers/GetDefaultWhatsapp";
import Ticket from "../models/Ticket";
import CreateTicketService from "../services/TicketServices/CreateTicketService";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
// const Sequelize = require("sequelize");
// const { startOfDay, endOfDay, parseISO } = require("date-fns");

// const Ticket = require("../models/Ticket");
// const Contact = require("../models/Contact");
// const Message = require("../models/Message");
// const Whatsapp = require("../models/Whatsapp");

// const { getIO } = require("../libs/socket");

// import FindWhatsAppService from "../services/WhatsappService/FindWhatsAppService";

type RequestQuery = {
  searchParam: string;
  pageNumber: string;
  status: string;
  date: string;
  showAll: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    searchParam,
    showAll
  } = req.query as RequestQuery;

  const userId = req.user.id;

  // let includeCondition = [
  //   {
  //     model: Contact,
  //     as: "contact",
  //     attributes: ["name", "number", "profilePicUrl"]
  //   }
  // ];

  // if (searchParam) {
  //   includeCondition = [
  //     ...includeCondition,
  //     {
  //       model: Message,
  //       as: "messages",
  //       attributes: ["id", "body"],
  //       where: {
  //         body: Sequelize.where(
  //           Sequelize.fn("LOWER", Sequelize.col("body")),
  //           "LIKE",
  //           "%" + searchParam.toLowerCase() + "%"
  //         )
  //       },
  //       required: false,
  //       duplicating: false
  //     }
  //   ];

  //   whereCondition = {
  //     [Sequelize.Op.or]: [
  //       {
  //         "$contact.name$": Sequelize.where(
  //           Sequelize.fn("LOWER", Sequelize.col("name")),
  //           "LIKE",
  //           "%" + searchParam.toLowerCase() + "%"
  //         )
  //       },
  //       { "$contact.number$": { [Sequelize.Op.like]: `%${searchParam}%` } },
  //       {
  //         "$message.body$": Sequelize.where(
  //           Sequelize.fn("LOWER", Sequelize.col("body")),
  //           "LIKE",
  //           "%" + searchParam.toLowerCase() + "%"
  //         )
  //       }
  //     ]
  //   };
  // }

  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    userId
  });

  return res.status(200).json({ tickets, count, hasMore });
};

interface TicketData {
  contactId: number;
  status: string;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status }: TicketData = req.body;

  const ticket = await CreateTicketService({ contactId, status });

  // const io = getIO();
  //   io.to("notification").emit("ticket", {
  //     action: "create",
  //     ticket: serializaedTicket
  //   });

  return res.status(200).json(ticket);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // const io = getIO();
  const { ticketId } = req.params;
  const ticketData: TicketData = req.body;

  const ticket = await UpdateTicketService({ ticketData, ticketId });

  // const ticket = await Ticket.findByPk(ticketId, {
  //   include: [
  //     {
  //       model: Contact,
  //       as: "contact",
  //       attributes: ["name", "number", "profilePicUrl"]
  //     }
  //   ]
  // });

  // if (!ticket) {
  //   return res.status(404).json({ error: "No ticket found with this ID" });
  // }

  // await ticket.update(req.body);

  // io.to("notification").emit("ticket", {
  //   action: "updateStatus",
  //   ticket: ticket
  // });

  return res.status(200).json(ticket);
};

// export const remove = (req: Request, res: Response): Promise<Response> => {
//   const io = getIO();
//   const { ticketId } = req.params;

//   const ticket = await Ticket.findByPk(ticketId);

//   if (!ticket) {
//     return res.status(400).json({ error: "No ticket found with this ID" });
//   }

//   await ticket.destroy();

//   io.to("notification").emit("ticket", {
//     action: "delete",
//     ticketId: ticket.id
//   });

//   return res.status(200).json({ message: "ticket deleted" });
// };
