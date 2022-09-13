import FileRegister from "../../database/models/FileRegister";
import {Op} from "sequelize"

interface Request {
  type?: string,
  fileId?: number | string,
  date?: string,
  companyId: number
}

const ListRegistersService = async ({
  type,
  fileId,
  date,
  companyId
}: Request) => {
  let whereCondition = null;

  const getDate = (option: string) => {
    if (option === "MORNING") {
      let morningDate = new Date(`${date} GMT-3`);
      morningDate.setHours(0, 0, 0, 0);
      return morningDate;
    }

    if (option === "NIGHT") {
      let nightDate = new Date(`${date} GMT-3`);
      nightDate.setHours(23, 59, 59, 999);
      return nightDate;
    }
  }

  if (fileId) {
    switch(type) {
      case 'sent':
        whereCondition = {
          sentAt: {[Op.ne]: null},
          fileId,
          companyId
        }
        break;
      case 'delivered':
        whereCondition = {
          deliveredAt: {[Op.ne]: null},
          fileId,
          companyId
        }
        break;
      case 'read':
        whereCondition = {
          readAt: {[Op.ne]: null},
          fileId,
          companyId
        }
        break;
      case 'error':
        whereCondition = {
          errorAt: {[Op.ne]: null},
          fileId,
          companyId
        }
        break;
      default:
        whereCondition = {
          fileId,
          companyId
        }
        break;
    }
  } else if (date) {
    switch(type) {
      case 'sent':
        whereCondition = {
          sentAt: {[Op.ne]: null},
          createdAt: {
            [Op.gte]: getDate("MORNING"),
            [Op.lte]: getDate("NIGHT"),
          },
        }
        break;
      case 'delivered':
        whereCondition = {
          deliveredAt: {[Op.ne]: null},
          createdAt: {
            [Op.gte]: getDate("MORNING"),
            [Op.lte]: getDate("NIGHT"),
          },
          companyId
        }
        break;
      case 'read':
        whereCondition = {
          readAt: {[Op.ne]: null},
          createdAt: {
            [Op.gte]: getDate("MORNING"),
            [Op.lte]: getDate("NIGHT"),
          },
          companyId
        }
        break;
      case 'error':
        whereCondition = {
          errorAt: {[Op.ne]: null},
          createdAt: {
            [Op.gte]: getDate("MORNING"),
            [Op.lte]: getDate("NIGHT"),
          },
          companyId
        }
        break;
      default:
        whereCondition = {
          createdAt: {
            [Op.gte]: getDate("MORNING"),
            [Op.lte]: getDate("NIGHT"),
          },
          companyId
        }
        break;
    }
  } else {
    switch(type) {
      case 'sent':
        whereCondition = { sentAt: { [Op.ne]: null }, companyId}
        break;
      case 'delivered':
        whereCondition = {deliveredAt: { [Op.ne]: null }, companyId}
        break;
      case 'read':
        whereCondition = { readAt: { [Op.ne]: null }, companyId}
        break;
      case 'error':
        whereCondition = { errorAt: { [Op.ne]: null }, companyId}
        break;
    }
  }

  const { count } = await FileRegister.findAndCountAll({
    where: whereCondition
  });

  return { count }
};

export default ListRegistersService;
