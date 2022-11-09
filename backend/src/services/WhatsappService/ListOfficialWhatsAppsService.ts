import { Sequelize } from "sequelize-typescript";
import { Op } from "sequelize";
import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";
import ShowConnectionFileByNameService from "../ConnectionFileService/ShowConnectionFileByNameService";

interface Request {
  companyId: string | number;
  official: string | boolean;
  pageNumber: string | number;
  connectionFileName?: string;
  searchParam?: string;
  status?: string;
}

interface Response {
  whatsapps: Whatsapp[];
  count: number;
  hasMore: boolean;
  connectionFileId: number | null;
}

const ListWhatsAppsService = async ({
  companyId,
  official,
  connectionFileName,
  pageNumber = 1,
  searchParam = "",
  status
}: Request): Promise<Response> => {
  let whereCondition = null;

  whereCondition = {
    official: official === "true",
    companyId,
    deleted: false,
  }

  const limit = 10;
  const offset = limit * (+pageNumber - 1);

  let connectionFileId = null;
  if (connectionFileName && connectionFileName !== "No Category") {
    const connectionFile = await ShowConnectionFileByNameService(
      connectionFileName,
      companyId
    );

    connectionFileId = connectionFile ? connectionFile.id : null

    whereCondition = {
      ...whereCondition,
      connectionFileId
    }
  } else {
    whereCondition = {
      ...whereCondition,
      connectionFileId: { [Op.is]: null }
    }
  }

  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      "$Whatsapp.name$": Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("Whatsapp.name")),
        "LIKE",
        `%${searchParam.toLowerCase()}%`
      ),
    }
  }

  if (status) {
    whereCondition = {
      ...whereCondition,
      status: status === "connected" ? "CONNECTED" : { [Op.ne]: "CONNECTED" }
    }
  }

  const { count, rows: whatsapps } = await Whatsapp.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      }
    ],
    order: [["status", "DESC"]]
  });

  const hasMore = count > offset + whatsapps.length;

  return {
    whatsapps,
    count,
    hasMore,
    connectionFileId
  };
};

export default ListWhatsAppsService;
