import Profiles from "../../database/models/Profiles";
import AppError from "../../errors/AppError";

const DeleteProfileService = async (
  id: string,
  companyId: number
): Promise<void> => {
  const profile = await Profiles.findOne({
    where: { id, companyId }
  });

  if (!profile) {
    throw new AppError("ERR_NO_PROFILE_FOUND", 404);
  }

  await profile.destroy();
};

export default DeleteProfileService;
