import { Sequelize, Op } from "sequelize";
import Invoices from "../../models/Invoices";

interface Request {
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  invoices: Invoices[];
  count: number;
  hasMore: boolean;
}

const ListInvoicesServices = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const whereCondition = {
    [Op.or]: [
      {
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("detail")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      }
    ]
  };
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: invoices } = await Invoices.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["id", "ASC"]]
  });

  const hasMore = count > offset + invoices.length;

  return {
    invoices,
    count,
    hasMore
  };
};

export default ListInvoicesServices;
