import { Op } from "sequelize";
import ConnectionFiles from "../../database/models/ConnectionFile";
import AppError from "../../errors/AppError";
import ShowConnectionFileService from "./ShowConnectionFileService";

interface ConnectionFileData {
  name?: string;
  icon?: string;
}

interface Request {
  connectionFileData: ConnectionFileData;
  connectionFileId: string | number;
  companyId: number;
}

const UpdateConnectionFileService = async ({
  connectionFileData,
  connectionFileId,
  companyId
}: Request): Promise<ConnectionFiles> => {
  const { name, icon } = connectionFileData;

  const exists = await ConnectionFiles.findOne({
    where: {
      name,
      companyId,
      id: { [Op.ne]: connectionFileId }
    }
  });

  if (exists || name === "No Category") {
    throw new AppError("ERR_NAME_ALREADY_EXISTS");
  }

  const connectionFile = await ShowConnectionFileService(
    connectionFileId,
    companyId
  );

  await connectionFile.update({
    name,
    icon
  });

  await connectionFile.reload();

  return connectionFile;
};

export default UpdateConnectionFileService;
