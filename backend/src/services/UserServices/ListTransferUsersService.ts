import { Sequelize, Op } from "sequelize";
import Company from "../../database/models/Company";
import Profiles from "../../database/models/Profiles";
import Queue from "../../database/models/Queue";
import User from "../../database/models/User";

interface Request {
  searchParam?: string;
  companyId: number;
}

const ListTransferUsersService = async ({
  searchParam = "",
  companyId
}: Request): Promise<User[]> => {
  let whereCondition = null;

  whereCondition = {
    [Op.or]: [
      {
        "$User.name$": Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("User.name")),
          "LIKE",
          `%${searchParam.toLowerCase()}%`
        )
      },
      { email: { [Op.like]: `%${searchParam.toLowerCase()}%` } }
    ],
    deletedAt: null,
    companyId
  };

  const users = await User.findAll({
    where: whereCondition,
    attributes: ["nickname", "name", "id", "email", "profileId", "createdAt", "useNickname"],
    order: [["createdAt", "DESC"]],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] }
      // { model: Company, as: "company", attributes: ["name"], required: true }
      // { model: Profiles, as: "profiles", attributes: ["id", "name", "permissions", "menus"] }
    ],
  });

  return users;
};

export default ListTransferUsersService;
