import FileRegister from "../../database/models/FileRegister";
import {Op} from "sequelize"

const ListRegistersService = async ({
  type,
  fileId,
}) => {
  let whereCondition = null;

  if (fileId) {
    switch(type) {
      case 'sent':
        whereCondition = {
          sentAt: {[Op.ne]: null},
          fileId: fileId
        }
        break;
      case 'delivered':
        whereCondition = {
          deliveredAt: {[Op.ne]: null},
          fileId: fileId
        }
        break;
      case 'read':
        whereCondition = {
          readAt: {[Op.ne]: null},
          fileId: fileId
        }
        break;
      case 'error':
        whereCondition = {
          errorMessage: {[Op.ne]: null},
          fileId: fileId
        }
        break;
      default:
        whereCondition = {
          fileId: fileId
        }
        break;
    }
  } else {
    switch(type) {
      case 'sent':
        whereCondition = {sentAt: {[Op.ne]: null}}
        break;
      case 'delivered':
        whereCondition = {deliveredAt: {[Op.ne]: null}}
        break;
      case 'read':
        whereCondition = {readAt: {[Op.ne]: null}}
        break;
      case 'error':
        whereCondition = {errorAt: {[Op.ne]: null}}
        break;
    }
  }

  const { count } = await FileRegister.findAndCountAll({
    where: whereCondition
  });

  return { count }
};

export default ListRegistersService;
