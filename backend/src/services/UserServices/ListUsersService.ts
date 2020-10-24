import { Sequelize, Op } from "sequelize";
import User from "../../models/User";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  users: User[];
  count: number;
  hasMore: boolean;
}

const ListUsersService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const whereCondition = {
    [Op.or]: [
      {
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("name")),
          "LIKE",
          `%${searchParam.toLowerCase()}%`
        )
      },
      { email: { [Op.like]: `%${searchParam.toLowerCase()}%` } }
    ]
  };
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: users } = await User.findAndCountAll({
    where: whereCondition,
    attributes: ["name", "id", "email", "profile"],
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = count > offset + users.length;

  return {
    users,
    count,
    hasMore
  };
};

export default ListUsersService;
