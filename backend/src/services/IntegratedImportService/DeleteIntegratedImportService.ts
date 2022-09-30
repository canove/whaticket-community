import IntegratedImport from "../../database/models/IntegratedImport";
import AppError from "../../errors/AppError";

const DeleteIntegratedImportService = async (id: string | number): Promise<void> => {
  const integratedImport = await IntegratedImport.findOne({
    where: { id }
  });

  if (!integratedImport) {
    throw new AppError("ERR_NO_IMPORT_FOUND", 404);
  }

  await integratedImport.destroy();
};

export default DeleteIntegratedImportService;
