import { Sequelize } from "sequelize";
import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";
import ShowConnectionFileByNameService from "../ConnectionFileService/ShowConnectionFileByNameService";
import Company from "../../database/models/Company";

interface Request {
  official?: boolean;
  officialWhatsappId?: string;
  companyId: number | string;
  deleted?: boolean;
  connectionFileId?: string[];
  status?: string;
  pageNumber?: string;
  limit?: string;
  name?: string;
  connectionFileName?: string;
  business?: string;
  anyCompany?: boolean;
}

interface Response {
  whatsapps: Whatsapp[];
  count: number;
  hasMore: boolean;
}

const ListWhatsAppsService2 = async ({ 
  official = false, 
  officialWhatsappId = null, 
  companyId,
  deleted = false,
  connectionFileId = null,
  status = "CONNECTED",
  pageNumber = "1",
  limit = "10",
  name = "",
  connectionFileName = "",
  business = null,
  anyCompany = false,
}: Request): Promise<Response> => {
  let whereCondition = null;

  whereCondition = { official, deleted };

  if (!anyCompany) {
    whereCondition = { ...whereCondition, companyId };
  }

  if (!official) {
    whereCondition = { ...whereCondition, status };
  }

  if (officialWhatsappId) {
    whereCondition = { ...whereCondition, officialWhatsappId };
  }

  if (connectionFileId) {
    whereCondition = { ...whereCondition, connectionFileId };
  }

  if (connectionFileName) {
    const connectionFile = await ShowConnectionFileByNameService({
      name: connectionFileName,
      companyId
    });

    whereCondition = { ...whereCondition, connectionFileId: connectionFile };
  }

  if (name) {
    whereCondition = {
      ...whereCondition,
      "$Whatsapp.name$": Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("Whatsapp.name")),
        "LIKE",
        `%${name.toLowerCase()}%`
      ),
    }
  }

  if (business) {
    whereCondition = { ...whereCondition, business: (business === "true") };
  }

  const offset = +limit * (+pageNumber - 1);

  const { count, rows: whatsapps } = await Whatsapp.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"],
        required: false,
      },
      {
        model: Company,
        as: "company",
        attributes: ["id", "name"],
        required: false,
      }
    ],
    limit: +limit > 0 ? +limit : null,
    offset: +limit > 0 ? offset : null,
  });

  const hasMore = count > (offset + whatsapps.length);

  return { 
    whatsapps, 
    count, 
    hasMore,
  };
};

export default ListWhatsAppsService2;
