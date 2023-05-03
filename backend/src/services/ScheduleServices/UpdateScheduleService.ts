import dayjs from "dayjs";
import ObjectSupport from "dayjs/plugin/objectSupport";
import schedule from "node-schedule";

import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import Schedule from "../../models/Schedule";
import Ticket from "../../models/Ticket";
import ShowContactService from "../ContactServices/ShowContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import SendWhatsAppMedia from "../WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";

interface ScheduleData {
  user: {
    id: string;
  };
  body: string;
  contacts: string[];
  time: string;
  date: string;
  medias: Express.Multer.File[];
}

interface Request {
  scheduleData: ScheduleData;
  scheduleId: string;
}

interface MessageInfos {
  body?: string;
  medias?: Express.Multer.File[];
  tickets: Ticket[];
}

async function sendAllMessages({ body = "", medias, tickets }: MessageInfos) {
  return Promise.all(
    tickets.map(async ticket => {
      if (medias) {
        return Promise.all(
          medias.map(async (media: Express.Multer.File) => {
            SendWhatsAppMedia({ media, ticket, scheduled: true });
          })
        );
      }
      return SendWhatsAppMessage({ body, ticket });
    })
  );
}

const UpdateScheduleService = async ({
  scheduleData,
  scheduleId
}: Request): Promise<Schedule> => {
  dayjs.extend(ObjectSupport);
  let sent: boolean | undefined;
  let job: schedule.Job | undefined;

  const scheduleDB = await Schedule.findOne({
    where: { id: scheduleId }
  });

  if (!scheduleDB) {
    throw new AppError("ERR_NO_QUICK_ANSWERS_FOUND", 404);
  }

  const { user, body, medias, time, date, contacts } = scheduleData;
  const [hour, minute] = time.split(":");
  const fullDate = dayjs(date);
  const io = getIO();

  const whatsapp = await GetDefaultWhatsApp(+user.id);

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
    sent = true;
  } else {
    job = schedule.scheduleJob(scheduleDB.name, ruler, async fireDate => {
      console.log("Sent -->", fireDate);
      await sendAllMessages({ body, medias, tickets });
      await scheduleDB.update(
        {
          sent: true
        },
        {
          where: { name: scheduleDB.name }
        }
      );
      await scheduleDB.reload({
        attributes: ["id", "body", "date", "mediaType", "sent", "name"],
        include: [
          {
            model: Contact,
            attributes: ["id", "name"]
          }
        ]
      });
      io.emit("schedules", {
        action: "update",
        schedule: scheduleDB
      });
    });

    if (!job) throw new Error("It was not possible update a scheduled message");
  }

  await scheduleDB.update({
    body,
    medias,
    time,
    sent,
    date: nowRuler.format(strFormat),
    mediaType: medias ? "file" : "chat"
  });

  await scheduleDB.$set("contacts", contacts);

  await scheduleDB.reload({
    attributes: ["id", "body", "date", "mediaType", "sent", "name"],
    include: [
      {
        model: Contact,
        attributes: ["id", "name"]
      }
    ]
  });

  io.emit("schedules", {
    action: "update",
    schedule: scheduleDB
  });

  return scheduleDB;
};

export default UpdateScheduleService;
