import AppError from "../../errors/AppError";
import Company from "../../models/Company";

type ScheduleData = {
  id: number | string;
  schedules: [];
};

const UpdateSchedulesService = async ({
  id,
  schedules
}: ScheduleData): Promise<Company> => {
  const company = await Company.findByPk(id);

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  await company.update({
    schedules
  });

  return company;
};

export default UpdateSchedulesService;
