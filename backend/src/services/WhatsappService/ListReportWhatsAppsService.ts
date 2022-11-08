import { Sequelize } from "sequelize-typescript";
import FileRegister from "../../database/models/FileRegister";
import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";

interface WhatsReports {
  whatsapp: Whatsapp;
  qtdeRegisters: number;
}

interface Request {
  searchParam: string;
  companyId: number;
}

interface Response {
  reports: WhatsReports[];
  count: number;
  hasMore: boolean;
}

const ListReportWhatsAppsService = async ({
  searchParam,
  companyId
}: Request): Promise<Response> => {
  let whereCondition = null;

  whereCondition = { companyId, deleted: false };

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

  const whatsReports = [];

  for (const whats of whatsapps) {
    const { count } = await FileRegister.findAndCountAll({
      where: { whatsappId: whats.id }
    });

    whatsReports.push({
      whatsapp: whats,
      qtdeRegisters: count
    });
  }

  const count = 0;
  const hasMore = false;

  return { reports: whatsReports, count, hasMore };
};

export default ListReportWhatsAppsService;
