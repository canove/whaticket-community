import IntegratedImport from "../../database/models/IntegratedImport";

interface Request {
  name: string;
  method: string;
  qtdeRegister: number;
  status: number;
  url: string;
  key: string;
  token: string;
  mapping: string;
  companyId: string | number;
  header: string;
  body: string;
  templateId: string | number;
  official: boolean | number;
  whatsappIds: string | null;
  officialConnectionId: string | number;
  officialTemplatesId: string | number;
}

const CreateIntegratedImportService = async ({
  name,
  method,
  qtdeRegister,
  status = 0,
  url,
  key,
  token,
  mapping,
  companyId,
  header,
  body,
  templateId,
  official,
  whatsappIds,
  officialConnectionId,
  officialTemplatesId
}: Request): Promise<IntegratedImport> => {
  if (whatsappIds.includes("Todos")) {
    whatsappIds = null;
  }

  if (templateId === "") {
    templateId = null;
  }

  const integratedImport = await IntegratedImport.create({
    name,
    method,
    qtdeRegister,
    status,
    url,
    key,
    token,
    mapping,
    companyId,
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

export default CreateIntegratedImportService;
