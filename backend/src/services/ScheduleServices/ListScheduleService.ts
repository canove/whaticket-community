import { Includeable, Sequelize, WhereOptions } from "sequelize";
import Contact from "../../models/Contact";
import Schedule from "../../models/Schedule";

interface Request {
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  schedules: Schedule[];
  count: number;
  hasMore: boolean;
}

const ListScheduleService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const includeCondition: Includeable[] = [
    {
      model: Contact,
      attributes: ["id", "name"]
    }
  ];

  const whereCondition: WhereOptions = {
    message: Sequelize.where(
      Sequelize.fn("LOWER", Sequelize.col("body")),
      "LIKE",
      `%${searchParam.toLowerCase().trim()}%`
    )
  };
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: schedules } = await Schedule.findAndCountAll({
    include: includeCondition,
    where: whereCondition,
    limit,
    offset,
    order: [["date", "ASC"]],
    attributes: ["id", "body", "date", "mediaType", "sent", "name"]
  });

  const hasMore = count > offset + schedules.length;

  return {
    schedules: schedules.reverse(),
    count,
    hasMore
  };
};

export default ListScheduleService;
