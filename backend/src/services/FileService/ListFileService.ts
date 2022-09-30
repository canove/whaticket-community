/*eslint-disable*/
import { Op } from "sequelize";
import File from "../../database/models/File";

interface Response {
  reports: File[];
  count: number;
  hasMore: boolean;
}

const ListFileService = async ({
  status,
  initialDate,
  companyId,
  pageNumber
}): Promise<Response> => {
  let where = null;

  if(status === ''){
    status = undefined;
  }
    
  if(initialDate === '') {
    initialDate = null;
  } 

  if (status != null && status != undefined && !initialDate) {
    where = {
      status: status
    };
  }

  if (!status && initialDate !== null) {
    where = {
      createdAt: {
        [Op.gte]: new Date(initialDate)
      }
    };
  }

  where = { ...where };
  if(companyId > 0)
    where = { ...where, companyId }

  if (pageNumber) {
    const limit = 10;
    const offset = limit * (+pageNumber - 1);

    const { count, rows: reports } = await File.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const hasMore = count > offset + reports.length;

    return { reports, count, hasMore };
  } else {
    const { count, rows: reports } = await File.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  
    const hasMore = false;

    return { reports, count, hasMore };
  }
};

export default ListFileService