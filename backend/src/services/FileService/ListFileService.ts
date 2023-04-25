/*eslint-disable*/
import { Op } from "sequelize";
import ConnectionFiles from "../../database/models/ConnectionFile";
import File from "../../database/models/File";
import OfficialTemplates from "../../database/models/OfficialTemplates";
import Templates from "../../database/models/TemplatesData";

interface Response {
  reports: File[];
  count: number;
  hasMore: boolean;
}

interface Request {
  status?: number | string;
  initialDate?: Date | string;
  companyId?: number;
  pageNumber?: number | string;
  limiting?: number;
  refusedStatus?: number;
}

const ListFileService = async ({
  status,
  initialDate,
  companyId,
  pageNumber,
  limiting,
  refusedStatus
}: Request): Promise<Response> => {
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

    if (refusedStatus) {
      where = {
        status: { 
          status,
          [Op.ne]: refusedStatus
        }
      }
    }
  }

  if (!status && initialDate !== null && initialDate !== undefined) {
    where = {
      createdAt: {
        [Op.gte]: new Date(initialDate)
      }
    };
  }

  if (refusedStatus || refusedStatus === 0) {
    where = {
      ...where,
      status: { [Op.ne]: refusedStatus }
    }
  }

  where = { ...where };
  if (companyId > 0) where = { ...where, companyId }

  if (pageNumber) {
    const limit = 10;
    const offset = limit * (+pageNumber - 1);

    const { count, rows: reports } = await File.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: Templates,
          as: "template",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: OfficialTemplates,
          as: "officialTemplate",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: ConnectionFiles,
          as: "connectionFile",
          attributes: ["id", "name"],
          required: false,
        },
      ]
    });

    const hasMore = count > offset + reports.length;

    return { reports, count, hasMore };
  } else {
    const { count, rows: reports } = await File.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: limiting
    });
  
    const hasMore = false;

    return { reports, count, hasMore };
  }
};

export default ListFileService;
