import ConnectionFiles from "../../database/models/ConnectionFile";
import AppError from "../../errors/AppError";

interface Request {
  name: string;
  icon: string;
  companyId: number;
  triggerInterval: string;
}

const CreateConnectionFileService = async ({
  name,
  icon,
  companyId,
  triggerInterval
}: Request): Promise<ConnectionFiles> => {
  const exists = await ConnectionFiles.findOne({
    where: { name, companyId }
  });

  if (exists || name === "No Category") {
    throw new AppError("ERR_NAME_ALREADY_EXISTS");
  }

  const connectionFile = await ConnectionFiles.create({
    name,
    icon,
    companyId,
    triggerInterval: triggerInterval === "null" ? null : triggerInterval
  });

  return connectionFile;
};

export default CreateConnectionFileService;
