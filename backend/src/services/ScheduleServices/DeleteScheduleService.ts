import { cancelJob } from "node-schedule";

import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import Schedule from "../../models/Schedule";

const DeleteScheduleService = async (id: string): Promise<void> => {
  const schedule = await Schedule.findOne({
    where: { id },
    include: [{ model: Contact }]
  });

  if (!schedule) {
    throw new AppError("ERR_NO_SCHEDULE_FOUND", 404);
  }

  cancelJob(schedule.name);
  await schedule.$remove("contacts", schedule.contacts);
  await schedule.destroy();

  const io = getIO();
  io.emit("schedules", {
    action: "delete",
    scheduleId: id
  });
};

export default DeleteScheduleService;
