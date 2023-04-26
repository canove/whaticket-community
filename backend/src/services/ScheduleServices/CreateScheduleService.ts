import { getIO } from "../../libs/socket";
import Schedule from "../../models/Schedule";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";

interface ScheduleData {
  id: string;
  ticketId: number;
  body: string;
  contactId?: number;
  mediaType?: string;
  mediaUrl?: string;
}

interface Request {
  scheduleData: ScheduleData;
}

const CreateScheduleService = async ({
  scheduleData
}: Request): Promise<Schedule> => {
  await Schedule.upsert(scheduleData);

  const schedule = await Schedule.findByPk(scheduleData.id, {
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        include: [
          "contact",
          "queue",
          {
            model: Whatsapp,
            as: "whatsapp",
            attributes: ["name"]
          }
        ]
      },
      {
        model: Schedule,
        as: "quotedMsg",
        include: ["contact"]
      }
    ]
  });

  if (!schedule) {
    throw new Error("ERR_CREATING_MESSAGE");
  }

  const io = getIO();
  io.to(schedule.ticketId.toString())
    .to(schedule.ticket.status)
    .to("notification")
    .emit("appSchedule", {
      action: "create",
      schedule,
      ticket: schedule.ticket,
      contact: schedule.ticket.contact
    });

  return schedule;
};

export default CreateScheduleService;
