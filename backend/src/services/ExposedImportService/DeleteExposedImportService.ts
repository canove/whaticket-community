import ExposedImport from "../../database/models/ExposedImport";
import AppError from "../../errors/AppError";

const DeleteExposedImportService = async (
  id: string,
  companyId: number
): Promise<void> => {
  const exposedImport = await ExposedImport.findOne({
    where: { id, companyId }
  });

  if (!exposedImport) {
    throw new AppError("ERR_NO_IMPORT_FOUND", 404);
  }

  await exposedImport.update({
    deletedAt: new Date()
  })

  // await exposedImport.destroy();
};

export default DeleteExposedImportService;
