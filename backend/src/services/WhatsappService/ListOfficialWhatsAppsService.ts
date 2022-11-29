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
  connectionName?: string;
  limit?: string;
  officialWhatsappId?: string;
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
  status,
  connectionName,
  limit = "10",
  officialWhatsappId
}: Request): Promise<Response> => {
  let whereCondition = null;

  whereCondition = {
    official: official === "true",
    companyId,
    deleted: false,
  }

  const offset = +limit * (+pageNumber - 1);

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

  if (officialWhatsappId) {
    whereCondition = {
      ...whereCondition,
      officialWhatsappId: officialWhatsappId,
    }
  }

  const { count, rows: whatsapps } = await Whatsapp.findAndCountAll({
    where: whereCondition,
    limit: +limit > 0 ? +limit : null,
    offset: +limit > 0 ? offset : null,
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      },
    ],
    order: [["status", "DESC"]]
  });

  const hasMore = count > offset + whatsapps.length;

  return {
    whatsapps,
    count,
    hasMore,
    connectionFileId,
  };
};

export default ListWhatsAppsService;
