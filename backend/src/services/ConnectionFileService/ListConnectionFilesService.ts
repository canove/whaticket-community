import { Op } from "sequelize";
import ConnectionFiles from "../../database/models/ConnectionFile";
import Whatsapp from "../../database/models/Whatsapp";

const ListConnectionFilesService = async (
  companyId: number
): Promise<ConnectionFiles[]> => {
  const connectionFiles = await ConnectionFiles.findAll({
    where: { companyId },
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
