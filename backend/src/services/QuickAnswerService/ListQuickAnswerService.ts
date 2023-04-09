import { Includeable, Sequelize, WhereOptions } from "sequelize";

import QuickAnswer from "../../models/QuickAnswer";
import User from "../../models/User";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  user: {
    id: string;
    profile: string;
  };
}

interface Response {
  quickAnswers: QuickAnswer[];
  count: number;
  hasMore: boolean;
}

const ListQuickAnswerService = async ({
  searchParam = "",
  pageNumber = "1",
  user
}: Request): Promise<Response> => {
  const includeCondition: Includeable[] = [
    {
      model: User,
      attributes: ["id", "name", "email"],
      where: user?.profile === "user" ? { id: user.id } : undefined
    }
  ];

  const whereCondition: WhereOptions = {
    message: Sequelize.where(
      Sequelize.fn("LOWER", Sequelize.col("message")),
      "LIKE",
      `%${searchParam.toLowerCase().trim()}%`
    )
  };
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows } = await QuickAnswer.findAndCountAll({
    include: includeCondition,
    where: whereCondition,
    limit,
    offset,
    order: [["message", "ASC"]]
  });

  const hasMore = count > offset + rows.length;

  const quickAnswers = await Promise.all(
    rows.map(async quickAnswer => {
      const quickAnswerId = String(quickAnswer.id);
      const quickAnswerFound = await QuickAnswer.findByPk(quickAnswerId, {
        include: [{ model: User, attributes: ["id", "name", "email"] }]
      });
      const hasUsers = !!quickAnswerFound?.get("users").length;
      if (hasUsers && quickAnswerFound) {
        quickAnswer.set("users", quickAnswerFound.get("users"));
      }
      return quickAnswer;
    })
  );

  return {
    quickAnswers,
    count,
    hasMore
  };
};

export default ListQuickAnswerService;
