import { Op } from "sequelize";
import File from "../../database/models/File";


interface Response {
};

const ListFileService = async ({
  Status,
  initialDate,
  limit = null
}): Promise< unknown > => {
  let where = null;
  if (Status !== undefined && !initialDate) {
    where = {
      status: Status
    };
  }
  if (!Status && initialDate !== null) {
    where = {
      createdAt: {
        [Op.gte]: new Date(initialDate)
      }
    };
  }

  // eslint-disable-next-line no-return-await
  //const { count, rows: tickets } = await Ticket.findAndCountAll(
  const { count, rows:files } = await File.findAndCountAll({
    where: where,
    limit
  });

  return {files, count}

};

export default ListFileService