/*eslint-disable*/
import { Op } from "sequelize";
import File from "../../database/models/File";

const ListFileService = async ({
  Status,
  initialDate,
  limit = null,
  companyId
}): Promise<File[] | undefined> => {
  let where = null;

  if(Status === ''){
    Status = undefined;
  }
    
  if(initialDate === '') {
    initialDate = null;
  } 

  if (Status != null && Status != undefined && !initialDate) {
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

  where = { ...where };
  if(companyId > 0)
    where = { ...where, companyId }

  return await File.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit
  });
};

export default ListFileService