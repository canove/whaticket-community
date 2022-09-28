import IntegratedImport from "../../database/models/IntegratedImport";

const ListIntegratedImportService = async (): Promise<IntegratedImport[]> => {
  const integratedImport = await IntegratedImport.findAll();

  return integratedImport;
};

export default ListIntegratedImportService;