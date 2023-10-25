import { Sequelize, Op } from "sequelize";
import Help from "../../models/Help";

interface Request {
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  records: Help[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const whereCondition = {
    [Op.or]: [
      {
        title: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("title")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      }
    ]
  };
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: records } = await Help.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["title", "ASC"]]
  });

  const hasMore = count > offset + records.length;

  return {
    records,
    count,
    hasMore
  };
};

export default ListService;
