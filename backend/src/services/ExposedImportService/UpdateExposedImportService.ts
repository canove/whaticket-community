import ExposedImport from "../../database/models/ExposedImport";
import ShowExposedImportService from "./ShowExposedImportService";

interface ExposedImportData {
  name: string;
  mapping: string;
}

interface Request {
  exposedImportData: ExposedImportData;
  exposedImportId: string;
  companyId: number;
}

const UpdateExposedImportService = async ({
  exposedImportData,
  exposedImportId,
  companyId
}: Request): Promise<ExposedImport> => {
  const exposedImport = await ShowExposedImportService(
    exposedImportId,
    companyId
  );

  const {
    name,
    mapping,
  } = exposedImportData;

  await exposedImport.update({
    name,
    mapping,
  });

  return exposedImport;
};

export default UpdateExposedImportService;
