import { Op } from "sequelize";
import Profiles from "../../database/models/Profiles";
import AppError from "../../errors/AppError";

const ShowProfileService = async (
  id: number | string,
  companyId: number | string
): Promise<Profiles> => {
  const profile = await Profiles.findOne({
    where: {
      id,
      companyId: { [Op.or]: [companyId, null] }
    }
  });

  if (!profile) {
    throw new AppError("ERR_NO_PROFILE_FOUND", 404);
  }

  return profile;
};

export default ShowProfileService;
