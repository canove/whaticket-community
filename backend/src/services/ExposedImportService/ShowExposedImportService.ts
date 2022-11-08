import ExposedImport from "../../database/models/ExposedImport";
import AppError from "../../errors/AppError";

const ShowExposedImportService = async (
  id: string,
  companyId: number
): Promise<ExposedImport> => {
  const exposedImport = await ExposedImport.findOne({
    where: { id, companyId }
  });

  if (!exposedImport) {
    throw new AppError("ERR_NO_IMPORT_FOUND", 404);
  }

  return exposedImport;
};

export default ShowExposedImportService;
