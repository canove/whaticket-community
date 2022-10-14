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
  body
}: Request): Promise<IntegratedImport> => {
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
    body
  });

  return integratedImport;
};

export default CreateIntegratedImportService;
