import { Op } from "sequelize";
import Profiles from "../../database/models/Profiles";

interface Request {
  companyId: number;
  pageNumber: string;
  limit: string;
}

interface Response {
  profiles: Profiles[];
  count: number;
}

const ListProfileService = async ({
  companyId,
  pageNumber = "1",
  limit = "10"
}: Request): Promise<Response> => {
  let whereCondition = null;

  whereCondition = {
    companyId: { [Op.or]: [companyId, null] }
  };

  const offset = +limit * (+pageNumber - 1);

  const { count, rows: profiles } = await Profiles.findAndCountAll({
    where: whereCondition,
    limit: +limit > 0 ? +limit : null,
    offset: +limit > 0 ? offset : null
  });

  return { profiles, count };
};

export default ListProfileService;
