import ConnectionFiles from "../../database/models/ConnectionFile";

const ListConnectionFilesService = async (
  companyId: number
): Promise<ConnectionFiles[]> => {
  const connectionFiles = await ConnectionFiles.findAll({
    where: { companyId },
    order: [["name", "ASC"]]
  });

  return connectionFiles;
};

export default ListConnectionFilesService;
