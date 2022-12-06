import IntegratedImport from "../../database/models/IntegratedImport";
import AppError from "../../errors/AppError";
import ShowIntegratedImportService from "./ShowIntegratedImportService";

interface IntegratedImportData {
  name: string;
  method: string;
  qtdeRegister: number;
  status: number | string;
  url: string;
  key: string;
  token: string;
  mapping: string;
  header: string;
  body: string;
  templateId: string | number;
  official: boolean | number;
  whatsappIds: string | null;
  officialConnectionId: string | number;
  officialTemplatesId: string | number;
}

interface Request {
  importData: IntegratedImportData;
  integratedImportId: number | string;
  companyId: number | string;
}

const UpdateIntegratedImportService = async ({
  importData,
  integratedImportId,
  companyId
}: Request): Promise<IntegratedImport> => {
  const integratedImport = await ShowIntegratedImportService(
    integratedImportId,
    companyId
  );

  const {
    name,
    method,
    qtdeRegister,
    status,
    url,
    key,
    token,
    mapping,
    header,
    body,
    templateId,
    official,
    whatsappIds,
    officialConnectionId,
    officialTemplatesId
  } = importData;

  await integratedImport.update({
    name,
    method,
    qtdeRegister,
    status,
    url,
    key,
    token,
    mapping,
    header,
    body,
    templateId,
    official,
    whatsappIds,
    officialConnectionId,
    officialTemplatesId
  });

  return integratedImport;
};

export default UpdateIntegratedImportService;
