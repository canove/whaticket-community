import Profiles from "../../database/models/Profiles";
import AppError from "../../errors/AppError";

const ShowProfileService = async (
  id: string,
  companyId: number
): Promise<Profiles> => {
  const profile = await Profiles.findOne({ where: { id, companyId } });

  if (!profile) {
    throw new AppError("ERR_NO_PROFILE_FOUND", 404);
  }

  return profile;
};

export default ShowProfileService;
