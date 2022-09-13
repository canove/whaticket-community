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
      status: Status,
      companyId
    };
  }

  if (!Status && initialDate !== null) {
    where = {
      createdAt: {
        [Op.gte]: new Date(initialDate)
      },
      companyId
    };
  }
  // eslint-disable-next-line no-return-await
  return await File.findAll({
    where: where,
    order: [['createdAt', 'DESC']],
    limit
  });
};

export default ListFileService