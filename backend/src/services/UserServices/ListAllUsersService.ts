import { Sequelize, Op } from "sequelize";
import Company from "../../database/models/Company";
import Profiles from "../../database/models/Profiles";
import Queue from "../../database/models/Queue";
import User from "../../database/models/User";

interface Request {
  companyId: number;
}

const ListAllUsersService = async ({
  companyId
}: Request): Promise<User[]> => {
  let whereCondition = null;

  whereCondition = { companyId, deletedAt: null };

  const users = await User.findAll({
    where: whereCondition,
    attributes: ["nickname", "name", "id", "useNickname"],
    order: [["createdAt", "DESC"]],
  });

  return users;
};

export default ListAllUsersService;
