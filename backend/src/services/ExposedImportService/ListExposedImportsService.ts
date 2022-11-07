import { Op } from "sequelize";
import ExposedImport from "../../database/models/ExposedImport";

const ListExposedImportService = async (
  companyId: string | number
): Promise<ExposedImport[]> => {
  const exposedImport = await ExposedImport.findAll({
    where: {
      companyId,
      deletedAt: { [Op.is]: null }
    },
    order: [["name", "ASC"]]
  });

  return exposedImport;
};

export default ListExposedImportService;
