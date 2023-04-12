import Historic from "../../database/models/Historic";
import User from "../../database/models/User";

interface Request {
  systemChange: number | string;
  registerId: number | string;
}

const ShowHistoricService = async ({
  systemChange,
  registerId
}: Request): Promise<Historic[]> => {
  const historics = await Historic.findAll({
    where: { systemChange, registerId },
    order: [["createdAt", "DESC"]],
    limit: 5,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"],
        where: { deletedAt: null },
        required: false,
      }
    ]
  });

  return historics;
};

export default ShowHistoricService;
