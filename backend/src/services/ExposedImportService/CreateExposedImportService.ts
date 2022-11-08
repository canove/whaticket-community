import ExposedImport from "../../database/models/ExposedImport";
import { v4 as uuidv4 } from "uuid";

interface Request {
    name: string;
    mapping: string;
    companyId: number;
}

const CreateExposedImportService = async ({
  name,
  mapping,
  companyId,
}: Request): Promise<ExposedImport> => {
  const exposedImport = await ExposedImport.create({
    id: uuidv4(),
    name,
    mapping,
    companyId,
  });

  return exposedImport;
};

export default CreateExposedImportService;
