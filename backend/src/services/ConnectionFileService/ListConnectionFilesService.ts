import { Op, where } from "sequelize";
import ConnectionFiles from "../../database/models/ConnectionFile";
import Whatsapp from "../../database/models/Whatsapp";

interface Request {
  companyId: number;
  selectedCompany?: string;
}

const ListConnectionFilesService = async ({
  companyId,
  selectedCompany,
}: Request): Promise<ConnectionFiles[]> => {
  let whereCondition = null;

  whereCondition = { companyId };

  if (companyId === 1 && selectedCompany) whereCondition = { companyId: selectedCompany };

  const connectionFiles = await ConnectionFiles.findAll({
    where: whereCondition,
    include: [
      {
        model: Whatsapp,
        as: "whatsapps",
        attributes: ["currentTriggerInterval", "automaticControl"],
        where: {
          status: "CONNECTED",
          deleted: false,
          official: false,
        },
        required: false,
      }
    ],
    order: [["name", "ASC"]]
  });

  return connectionFiles;
};

export default ListConnectionFilesService;
