import { Op } from "sequelize";
import File from "../../database/models/File";


interface Response {};

const ListFileService = async ({
  Status,
  initialDate,
  limit = null
}): Promise<File[] | undefined> => {
  let where = null;
  if (Status !== '' && initialDate == '') {
    where = {
      status: Status
    };
  }
  if (Status == '' && initialDate !== '') {
    where = {
      createdAt: {
        [Op.gte]: new Date(initialDate)
      }
    };
  }
  // eslint-disable-next-line no-return-await
  return await File.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit
  });
};

export default ListFileService