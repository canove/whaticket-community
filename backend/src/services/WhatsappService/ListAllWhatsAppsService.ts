import { Sequelize } from "sequelize-typescript";
import Company from "../../database/models/Company";
import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";

interface Response {
  whatsapps: Whatsapp[];
  hasMore: boolean;
  count: number;
}

const ListAllWhatsAppsService = async ({
  searchParam = "",
  company,
  pageNumber = "1",
  isBusiness = "false",
  all
}): Promise<Response> => {
  if (all) {
    const { count, rows: whatsapps } = await Whatsapp.findAndCountAll({
      where: {
        deleted: false,
        official: false,
        status: "CONNECTED",
      }
    });

    return { whatsapps, count, hasMore: false };
  }

  let whereCondition = null;

  whereCondition = {
    deleted: false,
    official: false,
    status: "CONNECTED",
  }

  if (isBusiness) {
    whereCondition = {
      ...whereCondition,
      business: isBusiness === "true",
    }
  }

  if (company) {
    whereCondition = {
      ...whereCondition,
      companyId: company,
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

  const limit = 10;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: whatsapps } = await Whatsapp.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      },
      {
        model: Company,
        as: "company",
        attributes: ["id", "name"]
      }
    ],
    order: [["status", "DESC"]],
    limit,
    offset
  });

  const hasMore = count > offset + whatsapps.length;

  return { whatsapps, count, hasMore };
};

export default ListAllWhatsAppsService;
