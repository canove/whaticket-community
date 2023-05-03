import ExposedImport from "../../database/models/ExposedImport";
import ShowExposedImportService from "./ShowExposedImportService";

interface ExposedImportData {
  name: string;
  mapping: string;
  template: string;
  connections: string[];
  requiredItems: string;
  connectionType: string | boolean;
  connectionFileId: string | number;
  connectionFileIds: string;
  officialTemplatesId: string | number;
  officialConnectionId: string | number;
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
    template,
    connections,
    requiredItems,
    connectionType,
    connectionFileId,
    connectionFileIds,
    officialTemplatesId,
    officialConnectionId,
  } = exposedImportData;

  let whatsappIds = null;
  let templateId = null;

  if (connections.includes("Todos")) {
    whatsappIds = null;
  } else {
    whatsappIds = connections.join(",");
  }

  if (template === "" || template === "Nenhum") {
    templateId = null;
  } else {
    templateId = template;
  }
  console.log("update exposedImport exposedImportService 46");
  await exposedImport.update({
    name,
    mapping,
    templateId,
    whatsappIds,
    requiredItems,
    connectionFileId,
    connectionFileIds,
    officialTemplatesId,
    officialConnectionId,
    official: connectionType,
  });

  return exposedImport;
};

export default UpdateExposedImportService;
