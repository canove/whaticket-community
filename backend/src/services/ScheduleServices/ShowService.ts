import Schedule from "../../models/Schedule";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import User from "../../models/User";

const ScheduleService = async (id: string | number, companyId: number): Promise<Schedule> => {
  const schedule = await Schedule.findByPk(id, {
    include: [
      { model: Contact, as: "contact", attributes: ["id", "name"] },
      { model: User, as: "user", attributes: ["id", "name"] },
    ]
  });

  if (schedule?.companyId !== companyId) {
    throw new AppError("Não é possível excluir registro de outra empresa");
  }

  if (!schedule) {
    throw new AppError("ERR_NO_SCHEDULE_FOUND", 404);
  }

  return schedule;
};

export default ScheduleService;
