import FileRegister from "../../database/models/FileRegister";
import {Op} from "sequelize"
interface Response {
}
const RegistersService = async ({
  type
}) => {
    let where = null ;

switch(type){
  case 'sent':
    where = {sentAt: {[Op.ne]: null}}
    break;
  case 'delivered':
    where = {deliveredAt: {[Op.ne]: null}}
    break;
  case 'read':
    where = {readAt: {[Op.ne]: null}}
}
  // eslint-disable-next-line no-return-await

const { count } = await FileRegister.findAndCountAll({
    where: where
  });

  return { count }
};

export default RegistersService;
