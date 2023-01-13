import { Op } from "sequelize";
import Profiles from "../../database/models/Profiles";
import AppError from "../../errors/AppError";

interface Request {
  name: string;
  menus: string[];
  permissions: string[];
  companyId: number;
}

const CreateProfileService = async ({
  name,
  menus = [],
  permissions = [],
  companyId
}: Request): Promise<Profiles> => {
  const profileWithSameName = await Profiles.findOne({
    where: {
      companyId: { [Op.or]: [companyId, null] },
      name: name
    }
  });

  if (profileWithSameName) throw new AppError("ERR_PROFILE_NAME_ALREADY_EXISTS");

  const profile = await Profiles.create({
    name,
    menus: JSON.stringify(menus),
    permissions: JSON.stringify(permissions),
    companyId
  });

  return profile;
};

export default CreateProfileService;
