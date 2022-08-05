import { Op } from "sequelize";
import File from "../../database/models/File";

interface Request {
  Status: number;
  initialDate: string;
}

interface Response {};

const ListFileService = async ({
  Status,
  initialDate
}: Request): Promise<Response | undefined> => {
  let whereCondition = null;
  if (Status !== undefined && !initialDate) {
    whereCondition = {
      status: Status
    };
  }
  if (!Status && initialDate !== undefined) {
    whereCondition = {
      createdAt: {
        [Op.gte]: new Date(initialDate)
      }
    };
  }

  // eslint-disable-next-line no-return-await
  return await File.findAll({
    where: whereCondition
  });
};
export default ListFileService;