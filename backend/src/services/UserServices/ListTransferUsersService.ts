import { Sequelize, Op } from "sequelize";
import Company from "../../database/models/Company";
import Profiles from "../../database/models/Profiles";
import Queue from "../../database/models/Queue";
import User from "../../database/models/User";

interface Request {
  searchParam?: string;
  queueId?: string | number;
  companyId: number;
}

const ListTransferUsersService = async ({
  searchParam = "",
  queueId,
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

  let includeCondition = [];

  includeCondition.push({ model: Company, as: "company", attributes: ["name"], required: true });
  includeCondition.push({ model: Profiles, as: "profiles", attributes: ["id", "name", "permissions", "menus"] });

  if (queueId) {
    const queueInclude = { 
      model: Queue, 
      as: "queues", 
      where: { id: queueId },
      attributes: ["id", "name", "color"],
      required: true
    }

    includeCondition.push(queueInclude);
  }

  const users = await User.findAll({
    where: whereCondition,
    attributes: ["name", "id", "email", "profileId", "createdAt"],
    order: [["createdAt", "DESC"]],
    include: includeCondition,
  });

  return users;
};

export default ListTransferUsersService;
