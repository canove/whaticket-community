import AppError from "../../errors/AppError";
import ConnectionFiles from "../../database/models/ConnectionFile";

const ShowConnectionFileByNameService = async (
  name: string | number,
  companyId: string | number
): Promise<ConnectionFiles> => {
  const connectionFile = await ConnectionFiles.findOne({
    where: {
      name,
      companyId
    }
  });

  if (!connectionFile) {
    throw new AppError("ERR_NO_CATEGORY_FOUND", 404);
  }

  return connectionFile;
};

export default ShowConnectionFileByNameService;
