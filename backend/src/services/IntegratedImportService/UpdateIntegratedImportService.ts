import IntegratedImport from "../../database/models/IntegratedImport";
import ShowIntegratedImportService from "./ShowIntegratedImportService";
interface IntegratedImportData {
    name: string;
    method: string;
    qtdeRegister: number;
    status: number;
    url: string;
    key: string;
    token: string;
    mapping: string;
}
interface Request {
  importData: IntegratedImportData;
  integratedImportId: number | string;
}

const UpdateIntegratedImportService = async ({
  importData,
  integratedImportId
}: Request): Promise<IntegratedImport> => {
  const integratedImport = await ShowIntegratedImportService(integratedImportId);

  const { name, method, qtdeRegister, status, url, key, token, mapping } =
    importData;

  await integratedImport.update({
    name,
    method,
    qtdeRegister,
    status,
    url,
    key,
    token,
    mapping,

  });

  return integratedImport;
};

export default UpdateIntegratedImportService;
