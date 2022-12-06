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
  pageNumber
}: Request): Promise<Response> => {
  let whatsCondition = null;

  whatsCondition = {
    id: Sequelize.literal('FileRegister.whatsappId'),
    deleted: false
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

  const limit = 10;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: whatsReports }: ReportData = await FileRegister.findAndCountAll({
    where: { whatsappId: { [Op.ne]: null }, companyId },
    attributes: [
      "whatsappId",
      [Sequelize.fn("COUNT", Sequelize.col("whatsappId")), "qtdeRegisters"],
    ],
    include: [{
      model: Whatsapp,
      attributes: ["name", "createdAt", "updatedAt"],
      where: whatsCondition
    }],
    group: "whatsappId",
    raw: true
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
