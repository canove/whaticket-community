import { Op } from "sequelize";
import Profiles from "../../database/models/Profiles";
import AppError from "../../errors/AppError";
import ShowProfileService from "./ShowProfileService";

interface ProfileData {
  name: string;
  permissions: string[];
  menus: string[];
}

interface Request {
  profileData: ProfileData;
  profileId: string;
  companyId: number;
}

const UpdateProfileService = async ({
  profileData,
  profileId,
  companyId
}: Request): Promise<Profiles> => {
  const profile = await ShowProfileService(profileId, companyId);

  const { name, menus, permissions } = profileData;

  const profileWithSameName = await Profiles.findOne({
    where: {
      companyId: { [Op.or]: [companyId, null] },
      name: name
    }
  });

  if (profileWithSameName) throw new AppError("ERR_PROFILE_NAME_ALREADY_EXISTS");

  await profile.update({
    name,
    permissions: JSON.stringify(permissions),
    menus: JSON.stringify(menus)
  });

  return profile;
};

export default UpdateProfileService;
