import dayjs from "dayjs";
import ObjectSupport from "dayjs/plugin/objectSupport";
import { Request, Response } from "express";
import schedule from "node-schedule";
import AppError from "../errors/AppError";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";

import GetDefaultWhatsApp from "../helpers/GetDefaultWhatsApp";
import Ticket from "../models/Ticket";
import ShowContactService from "../services/ContactServices/ShowContactService";
import ListScheduleService from "../services/ScheduleServices/ListScheduleService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

type IndexQuery = {
  pageNumber: string;
};

type ScheduleData = {
  body: string;
  contacts: number[];
  time: string;
  date: string;
};

type MessageInfos = {
  body?: string;
  medias?: Express.Multer.File[];
  tickets: Ticket[];
};

async function sendAllMessages({ body = "", medias, tickets }: MessageInfos) {
  return Promise.all(
    tickets.map(ticket => {
      if (medias) {
        return Promise.all(
          medias.map(async (media: Express.Multer.File) => {
            await SendWhatsAppMedia({ media, ticket });
          })
        );
      }
      return SendWhatsAppMessage({ body, ticket });
    })
  );
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;

  const { count, schedules, ticket, hasMore } = await ListScheduleService({
    pageNumber,
    ticketId
  });

  SetTicketMessagesAsRead(ticket);

  return res.json({ count, schedules, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  dayjs.extend(ObjectSupport);
  const { body, time, date, contacts }: ScheduleData = req.body;
  const medias = req.files as Express.Multer.File[];
  const [hour, minute] = time.split(":");
  const fullDate = dayjs(date);

  const whatsapp = await GetDefaultWhatsApp(+req.user.id);
  const tickets = await Promise.all(
    contacts.map(async contact => {
      const contactById = await ShowContactService(contact);
      const groupContact = contactById.isGroup ? contactById : undefined;
      const ticketFound = await FindOrCreateTicketService(
        contactById,
        whatsapp.id,
        0,
        groupContact
      );
      const { ticket } = await UpdateTicketService({
        ticketData: { status: "open" },
        ticketId: ticketFound.id
      });
      return ticket;
    })
  );

  const ruler = new schedule.RecurrenceRule();
  ruler.date = fullDate.get("date");
  ruler.month = fullDate.get("month");
  ruler.year = fullDate.get("year");
  ruler.hour = +hour;
  ruler.minute = +minute;
  ruler.second = 1;
  ruler.tz = "America/Fortaleza";

  const strFormat = "YYYY-MM-DD HH:mm";
  const nowDate = dayjs();
  const nowRuler = dayjs({
    year: ruler.year,
    date: ruler.date,
    month: ruler.month,
    hour: ruler.hour,
    minute: ruler.minute
  });

  if (nowDate.format(strFormat) === nowRuler.format(strFormat)) {
    await sendAllMessages({ body, medias, tickets });
    return res.status(201).send();
  }

  const job = schedule.scheduleJob(ruler, async fireDate => {
    console.log("Sent -->", fireDate);
    await sendAllMessages({ body, medias, tickets });
  });

  if (job) return res.status(201).send();

  throw new AppError("ERR_SCHEDULING_WAPP_MSG");
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit("appMessage", {
    action: "update",
    message
  });

  return res.send();
};
