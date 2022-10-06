import IntegratedImport from "../../database/models/IntegratedImport";
import AppError from "../../errors/AppError";

const ShowIntegratedImportService = async (
  id: string | number,
  companyId: string | number
): Promise<IntegratedImport> => {
  const integratedImport = await IntegratedImport.findOne({
    where: { id, companyId }
  });

  if (!integratedImport) {
    throw new AppError("ERR_NO_IMPORT_FOUND", 404);
  }

  return integratedImport;
};

export default ShowIntegratedImportService;
