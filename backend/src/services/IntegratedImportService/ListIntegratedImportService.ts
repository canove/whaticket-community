import IntegratedImport from "../../database/models/IntegratedImport";

const ListIntegratedImportService = async (
  companyId: string | number
): Promise<IntegratedImport[]> => {
  const integratedImport = await IntegratedImport.findAll({
    where: { companyId },
    order: [["name", "ASC"]]
  });

  return integratedImport;
};

export default ListIntegratedImportService;
