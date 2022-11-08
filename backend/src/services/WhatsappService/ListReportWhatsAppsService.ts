import { Sequelize } from "sequelize-typescript";
import { Op } from "sequelize";
import FileRegister from "../../database/models/FileRegister";
import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";

interface WhatsReports {
  whatsapp: Whatsapp;
  qtdeRegisters: number;
}

interface Request {
  companyId: number;
  searchParam?: string;
  status?: string;
  pageNumber?: string;
}

interface Response {
  reports: WhatsReports[];
  count: number;
  hasMore: boolean;
}

const ListReportWhatsAppsService = async ({
  searchParam,
  status,
  companyId,
  pageNumber
}: Request): Promise<Response> => {
  let whereCondition = null;

  whereCondition = { companyId, deleted: false };

  if (status === "deleted") whereCondition = { ...whereCondition, deleted: true };
  if (status === "connected") whereCondition = { ...whereCondition, status: "CONNECTED" }
  if (status === "disconnected") whereCondition = { ... whereCondition, status: { [Op.ne]: "CONNECTED" } }

  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      "$Whatsapp.name$": Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("Whatsapp.name")),
        "LIKE",
        `%${searchParam.toLowerCase()}%`
      )
    }
  }

  const whatsapps = await Whatsapp.findAll({
    where: whereCondition,
  });

  let whatsReports = [];

  const limit = 10;
  const offset = limit * (+pageNumber - 1);

  for (const whats of whatsapps) {    
    const { count } = await FileRegister.findAndCountAll({
      where: { whatsappId: whats.id }
    });

    if (count === 0) continue;

    whatsReports.push({
      whatsapp: whats,
      qtdeRegisters: count
    });
  }

  const count = whatsReports.length;

  whatsReports = whatsReports.slice(offset, offset + limit);

  const hasMore = count > whatsReports.length;

  return { reports: whatsReports, count, hasMore };
};

export default ListReportWhatsAppsService;
