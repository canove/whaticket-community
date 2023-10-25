import Announcement from "../../models/Announcement";
import AppError from "../../errors/AppError";

const ShowService = async (id: string | number): Promise<Announcement> => {
  const record = await Announcement.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_ANNOUNCEMENT_FOUND", 404);
  }

  return record;
};

export default ShowService;
