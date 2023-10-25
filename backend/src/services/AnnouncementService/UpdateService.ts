import AppError from "../../errors/AppError";
import Announcement from "../../models/Announcement";

interface Data {
  id: number | string;
  priority: string;
  title: string;
  text: string;
  status: string;
  companyId: number;
}

const UpdateService = async (data: Data): Promise<Announcement> => {
  const { id } = data;

  const record = await Announcement.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_ANNOUNCEMENT_FOUND", 404);
  }

  await record.update(data);

  return record;
};

export default UpdateService;
