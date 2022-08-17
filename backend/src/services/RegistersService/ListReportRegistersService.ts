import FileRegister from "../../database/models/FileRegister";
import {Op} from "sequelize"

interface Request {
  statuses?: Array<any>;
  fileIds?: Array<any>;
  pageNumber?: string | number;
}

const ListReportRegistersService = async ({
  statuses,
  fileIds,
  pageNumber = "1"
}: Request) => {
  let whereCondition = null;

  if (fileIds) {
    whereCondition = {
      fileId: {
        [Op.or]: fileIds,
      },
    };
  }

  const getStatuses = () => {
    let array = [];

    if (statuses.includes('sent')) {
      array.push({sentAt: {[Op.ne]: null}});
    }

    if (statuses.includes('delivered')) {
      array.push({deliveredAt: {[Op.ne]: null}});
    }

    if (statuses.includes('read')) {
      array.push({readAt: {[Op.ne]: null}});
    }

    if (statuses.includes('error')) {
      array.push({errorAt: {[Op.ne]: null}});
    }

    return array;
  }

  if (statuses) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: getStatuses()
    }
  }

  if (pageNumber === "ALL") {
    const { count, rows: registers } = await FileRegister.findAndCountAll({
      where: whereCondition,
    });

    const hasMore = false;

    return { registers, count, hasMore };
  } else {
    const limit = 20;
    const offset = limit * (+pageNumber - 1);

    const { count, rows: registers } = await FileRegister.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
    });

    const hasMore = count > offset + registers.length;

    return { registers, count, hasMore };
  }
};

export default ListReportRegistersService;
