import AppError from "../../errors/AppError";
import ConnectionFiles from "../../database/models/ConnectionFile";

const ShowConnectionFileService = async (
  id: string | number,
  companyId: number
): Promise<ConnectionFiles> => {
  const connectionFile = await ConnectionFiles.findOne({
    where: {
      id,
      companyId
    }
  });

  if (!connectionFile) {
    throw new AppError("ERR_NO_CONNECTION_FILE_FOUND", 404);
  }

  return connectionFile;
};

export default ShowConnectionFileService;
