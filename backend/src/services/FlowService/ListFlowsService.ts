import { Sequelize } from "sequelize-typescript";
import Flows from "../../database/models/Flows";
import { Op } from "sequelize";

interface Request {
  companyId: number | string;
  searchParam?: string;
  type?: string;
  official?: string;
  selectedCompany?: string;
}

const ListFlowsService = async ({
  companyId,
  searchParam,
  type,
  official,
  selectedCompany,
}: Request): Promise<Flows[]> => {
  let whereCondition = null;

  whereCondition = { companyId };

  if (companyId === 1 && selectedCompany) whereCondition = { companyId: selectedCompany };

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
