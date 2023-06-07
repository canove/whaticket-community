import AppError from "../../errors/AppError";
import ConnectionFiles from "../../database/models/ConnectionFile";

interface Request {
  name: string | number;
  companyId: string | number;
}

const ShowConnectionFileByNameService = async ({
  name,
  companyId
}: Request): Promise<ConnectionFiles> => {
  const connectionFile = await ConnectionFiles.findOne({
    where: { name, companyId }
  });

  if (!connectionFile) {
    throw new AppError("ERR_NO_CATEGORY_FOUND", 404);
  }

  return connectionFile;
};

export default ShowConnectionFileByNameService;
