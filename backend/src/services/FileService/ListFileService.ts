import { Op } from "sequelize";
import File from "../../database/models/File";


interface Response {};

const ListFileService = async ({
  Status,
  initialDate,
  limit = null
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
  // eslint-disable-next-line no-return-await
  return await File.findAll({
    where: where,
    order: [['createdAt', 'DESC']],
    limit
  });
};

export default ListFileService