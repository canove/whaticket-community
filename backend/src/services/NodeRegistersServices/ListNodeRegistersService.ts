import { Sequelize } from "sequelize-typescript";
import Flows from "../../database/models/Flows";
import NodeRegisters from "../../database/models/NodeRegisters";

interface Request {
  phoneNumber?: string;
  pageNumber?: string;
  flow?: string;
  response?: string;
  nodeId?: string;
  companyId: number | string;
}

interface Response {
  reports: NodeRegisters[];
  count: number;
  hasMore: boolean;
}

const ListNodeRegistersService = async ({
  phoneNumber,
  pageNumber = "1",
  companyId,
  flow,
  response,
  nodeId
}: Request): Promise<Response> => {
  let whereCondition = null;

  whereCondition = {
    companyId
  };

  if (phoneNumber) {
    whereCondition = {
      ...whereCondition,
      "$NodeRegisters.phoneNumber$": Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("NodeRegisters.phoneNumber")),
        "LIKE",
        `%${phoneNumber.toLowerCase()}%`
      )
    };
  }

  if (flow) {
    whereCondition = {
      ...whereCondition,
      flowId: flow
    };
  }

  if (response) {
    whereCondition = {
      ...whereCondition,
      response
    };
  }

  if (nodeId) {
    whereCondition = {
      ...whereCondition,
      "$NodeRegisters.nodeId$": Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("NodeRegisters.nodeId")),
        "LIKE",
        `%${nodeId.toLowerCase()}%`
      )
    };
  }

  const limit = 10;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: reports } = await NodeRegisters.findAndCountAll({
    where: whereCondition,
    limit: offset < 0 ? null : limit,
    offset: offset < 0 ? null : offset,
    include: [
      {
        model: Flows,
        as: "flow",
        attributes: ["id", "name"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  const hasMore = count > offset + reports.length;

  return {
    reports: reports.reverse(),
    count,
    hasMore
  };
};

export default ListNodeRegistersService;
