import AppError from "../../errors/AppError";
import ConnectionFiles from "../../database/models/ConnectionFile";

interface Request {
  name: string | number;
  companyId: string | number;
}

const ShowConnectionFileByNameService = async ({
  name,
  companyId
}: Request): Promise<number> => {
  if (name === "No Category") return null;

  const connectionFile = await ConnectionFiles.findOne({
    where: { name, companyId },
    attributes: ["id"],
  });

  if (!connectionFile) {
    throw new AppError("ERR_NO_CATEGORY_FOUND", 404);
  }

  return connectionFile.id;
};

export default ShowConnectionFileByNameService;
