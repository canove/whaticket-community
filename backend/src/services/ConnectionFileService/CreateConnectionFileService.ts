import { Op } from "sequelize";
import ConnectionFiles from "../../database/models/ConnectionFile";
import AppError from "../../errors/AppError";

interface Request {
  name: string;
  icon?: string;
  companyId: number;
  triggerInterval?: string;
  greetingMessage?: string; 
  farewellMessage?: string;
  uniqueCode?: string;
}

const CreateConnectionFileService = async ({
  name,
  icon,
  companyId,
  triggerInterval = null,
  greetingMessage = null, 
  farewellMessage = null,
  uniqueCode = null,
}: Request): Promise<ConnectionFiles> => {
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
      companyId 
    }
  });

  if (exists || name === "No Category") {
    throw new AppError("ERR_NAME_OR_CODE_ALREADY_EXISTS");
  }

  const connectionFile = await ConnectionFiles.create({
    name,
    icon,
    companyId,
    triggerInterval: triggerInterval === "null" ? null : triggerInterval,
    greetingMessage: greetingMessage === "null" ? null : greetingMessage, 
    farewellMessage: farewellMessage === "null" ? null : farewellMessage,
    uniqueCode
  });

  return connectionFile;
};

export default CreateConnectionFileService;
