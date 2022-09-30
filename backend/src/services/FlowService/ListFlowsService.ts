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
  const flows = await Flows.findAll({
    where: {
      companyId,
      "$Flows.name$": Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("Flows.name")),
        "LIKE",
        `%${searchParam.toLowerCase()}%`
      )
    }
  });

  return flows;
};

export default ListFlowsService;
