import { Sequelize } from "sequelize-typescript";
import Flows from "../../database/models/Flows";
import { Op } from "sequelize";

interface Request {
  companyId: number;
  searchParam?: string;
  type?: string;
  official?: string;
}

const ListFlowsService = async ({
  companyId,
  searchParam,
  type,
  official
}: Request): Promise<Flows[]> => {
  let whereCondition = null;

  whereCondition = { 
    companyId,
  };

  if (official) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        { official: official === "true" ? true : false },
        { official: null }
      ],
    }
  }

  if (type) {
    whereCondition = {
      ...whereCondition,
      type
    };
  }

  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      "$Flows.name$": Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("Flows.name")),
        "LIKE",
        `%${searchParam.toLowerCase()}%`
      )
    };
  }

  const flows = await Flows.findAll({
    where: whereCondition
  });

  return flows;
};

export default ListFlowsService;
