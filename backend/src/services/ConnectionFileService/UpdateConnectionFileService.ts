import { Op } from "sequelize";
import ConnectionFiles from "../../database/models/ConnectionFile";
import AppError from "../../errors/AppError";
import ShowConnectionFileService from "./ShowConnectionFileService";

interface ConnectionFileData {
  name: string;
  icon?: string;
  triggerInterval?: string;
  greetingMessage?: string; 
  farewellMessage?: string;
  uniqueCode?: string;
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
  const { name, icon, triggerInterval,greetingMessage, farewellMessage, uniqueCode } = connectionFileData;

  let nameExists = [];

  nameExists.push({ name: name });
  nameExists.push({ uniqueCode: name });

  if (uniqueCode) {
    nameExists.push({ name: uniqueCode });
    nameExists.push({ uniqueCode: uniqueCode });
  }

  const exists = await ConnectionFiles.findOne({
    where: {
      [Op.or]: nameExists,
      id: { [Op.ne]: connectionFileId },
      companyId,
    }
  });

  if (exists || name === "No Category") {
    throw new AppError("ERR_NAME_OR_CODE_ALREADY_EXISTS");
  }

  const connectionFile = await ShowConnectionFileService(
    connectionFileId,
    companyId
  );

  console.log("update connectionFile connectionFileService 41");
  await connectionFile.update({
    name,
    icon,
    triggerInterval: triggerInterval === "null" ? null : triggerInterval,
    greetingMessage: greetingMessage === "null" ? null : greetingMessage, 
    farewellMessage: farewellMessage === "null" ? null : farewellMessage,
    uniqueCode
  });

  await connectionFile.reload();

  return connectionFile;
};

export default UpdateConnectionFileService;
