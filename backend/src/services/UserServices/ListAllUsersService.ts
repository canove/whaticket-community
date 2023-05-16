import { Sequelize, Op } from "sequelize";
import Company from "../../database/models/Company";
import Profiles from "../../database/models/Profiles";
import Queue from "../../database/models/Queue";
import User from "../../database/models/User";
import ShowUserService from "./ShowUserService";

interface Request {
  companyId: number;
  loggedInUserId: string | number;
}

const ListAllUsersService = async ({
  companyId,
  loggedInUserId
}: Request): Promise<User[]> => {
  let whereCondition = null;

  const loggedInUser = await ShowUserService(loggedInUserId, companyId);
  const userQueues = loggedInUser?.queues?.map((q) => q.id);;

  whereCondition = { companyId, deletedAt: null };

  const users = await User.findAll({
    where: whereCondition,
    attributes: ["id", "name", "nickname", "useNickname"],
    include: [
      {
        model: Queue,
        as: "queues",
        where: { id: userQueues },
        required: true,
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return users;
};

export default ListAllUsersService;
