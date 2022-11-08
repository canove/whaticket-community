import { Op } from "sequelize";
import ExposedImport from "../../database/models/ExposedImport";

interface Request {
  pageNumber: string;
  companyId: number;
}

interface Response {
  exposedImports: ExposedImport[];
  count: number;
  hasMore: boolean;
}

const ListExposedImportService = async ({
  pageNumber,
  companyId
}: Request): Promise<Response> => {
  const limit = 10;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: exposedImports } = await ExposedImport.findAndCountAll({
    where: {
      companyId,
      deletedAt: { [Op.is]: null }
    },
    order: [["name", "ASC"]],
    limit,
    offset
  });

  const hasMore = count > offset + exposedImports.length;

  return { exposedImports, count, hasMore };
};

export default ListExposedImportService;
