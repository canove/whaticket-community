import { Sequelize } from "sequelize-typescript";
import { Op } from "sequelize";
import FileRegister from "../../database/models/FileRegister";
import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";
import { endOfDay, parseISO, startOfDay } from "date-fns";

interface WhatsReports {
  whatsapp: Whatsapp;
  qtdeRegisters: number;
}

interface Request {
  companyId: number;
  searchParam?: string;
  status?: string;
  pageNumber?: string;
  date?: string;
}

interface Response {
  reports: FileRegister[];
  count: number;
  hasMore: boolean;
}

interface ReportData {
  count: number | number[];
  rows: FileRegister[]
}

const ListReportWhatsAppsService = async ({
  searchParam,
  status,
  companyId,
  pageNumber,
  date
}: Request): Promise<Response> => {
  let whatsCondition = null;
  let regCondition = null;

  whatsCondition = {
    id: Sequelize.literal('FileRegister.whatsappId'),
    deleted: false
  };

  regCondition = { 
    whatsappId: { [Op.ne]: null }, 
    companyId 
  };

  if (status === "deleted") whatsCondition = { ...whatsCondition, deleted: true };
  if (status === "connected") whatsCondition = { ...whatsCondition, status: "CONNECTED" }
  if (status === "disconnected") whatsCondition = { ... whatsCondition, status: { [Op.ne]: "CONNECTED" } }

  if (searchParam) {
    whatsCondition = {
      ...whatsCondition,
      name: { [Op.like]: `%${searchParam.toLowerCase()}%` }
    }
  }

  if (date) {
    regCondition = {
      ...regCondition,
      processedAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      },
    }
  }

  const limit = 15;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: whatsReports }: ReportData = await FileRegister.findAndCountAll({
    where: regCondition,
    attributes: [
      "whatsappId",
      [Sequelize.fn("COUNT", Sequelize.col("whatsappId")), "qtdeRegisters"],
    ],
    include: [{
      model: Whatsapp,
      attributes: ["name", "createdAt", "updatedAt", "sleeping"],
      where: whatsCondition
    }],
    limit,
    offset,
    group: "whatsappId",
  });

  const countNumber =  Array.isArray(count) ? count.length : count;

  const hasMore = countNumber > offset + whatsReports.length;

  return {
    reports: whatsReports,
    count: countNumber,
    hasMore
  };
};

export default ListReportWhatsAppsService;
