import AppError from "../../errors/AppError";
import ConnectionFiles from "../../database/models/ConnectionFile";

const DeleteConnectionFileService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  const connectionFile = await ConnectionFiles.findOne({
    where: { id, companyId }
  });

  if (!connectionFile) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  await connectionFile.destroy();
};

export default DeleteConnectionFileService;
