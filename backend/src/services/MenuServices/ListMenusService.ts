import { Sequelize } from "sequelize-typescript";
import { Op } from "sequelize";
import Company from "../../database/models/Company";
import Menu from "../../database/models/Menu";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
}
interface Response {
  count: number;
  hasMore: boolean;
  menus: Menu[];
}

const ListMenusService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const whereCondition = {
    [Op.or]: [
      {
        "$Menu.name$": Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("Menu.name")),
          "LIKE",
          `%${searchParam.toLowerCase()}%`
        )
      },
      { id: { [Op.like]: `%${searchParam.toLowerCase()}%` } }
    ]
  };

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: menus } = await Menu.findAndCountAll({
    where: whereCondition,
    attributes: [
      "id",
      "name",
      "icon",
      "isParent",
      "parentId",
      "createdAt",
      "updatedAt"
    ],
    include: [
      {
        model: Company,
        as: "companies",
        attributes: ["id"]
      }
    ]
  });

  const hasMore = count > offset + menus.length;

  return {
    menus,
    count,
    hasMore
  };
};

export default ListMenusService;
