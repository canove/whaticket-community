import dayjs from "dayjs";
import { Request, Response } from "express";
import { RecurrenceRule, scheduleJob } from "node-schedule";
import AppError from "../errors/AppError";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";

import ListScheduleService from "../services/ScheduleServices/ListScheduleService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

type IndexQuery = {
  pageNumber: string;
};

type ScheduleData = {
  body: string;
  quotedMsg?: Message;
  time: string;
  date: string;
};

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
  const { ticketId } = req.params;
  const { body, quotedMsg, time, date }: ScheduleData = req.body;
  const medias = req.files as Express.Multer.File[];
  const [hour, minute] = time.split(":");
  const fullDate = dayjs(date);

  const ticket = await ShowTicketService(ticketId);

  const ruler = new RecurrenceRule();
  ruler.date = fullDate.get("date");
  ruler.month = fullDate.get("month");
  ruler.year = fullDate.get("year");
  ruler.hour = +hour;
  ruler.minute = +minute;
  ruler.tz = "America/Fortaleza";

  const job = scheduleJob(ruler, async fireDate => {
    console.log("Sent -->", fireDate);

    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          await SendWhatsAppMedia({ media, ticket });
        })
      );
    } else {
      await SendWhatsAppMessage({ body, ticket, quotedMsg });
    }
  });

  if (job) return res.send();

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
