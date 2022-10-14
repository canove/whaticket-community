import { Sequelize } from "sequelize-typescript";
import Flows from "../../database/models/Flows";

interface Request {
  companyId: number;
  searchParam: string;
}

const ListFlowsService = async ({
  companyId,
  searchParam
}: Request): Promise<Flows[]> => {
  let whereCondition = null;

  whereCondition = { companyId };

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
