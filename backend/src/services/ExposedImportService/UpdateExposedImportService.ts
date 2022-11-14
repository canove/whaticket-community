import ExposedImport from "../../database/models/ExposedImport";
import ShowExposedImportService from "./ShowExposedImportService";

interface ExposedImportData {
  name: string;
  mapping: string;
  template: string;
  connections: string[];
  connectionType: string | boolean;
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

  const { name, mapping, template, connections, connectionType } =
    exposedImportData;

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

  await exposedImport.update({
    name,
    mapping,
    templateId,
    official: connectionType,
    whatsappIds
  });

  return exposedImport;
};

export default UpdateExposedImportService;
