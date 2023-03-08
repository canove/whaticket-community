import { Op } from "sequelize";
import Company from "../../database/models/Company";
import Menu from "../../database/models/Menu";
import ShowUserService from "../UserServices/ShowUserService";

const ShowCompanyMenuService = async (companyId: number, userId: string | number): Promise<Menu[]> => {
  const user = await ShowUserService(userId, companyId);

  let menuList = null;

  try {
    menuList = JSON.parse(user.profiles.menus);
  } catch {
    menuList = [];
  }

  let whereCondition = null;

  if (menuList !== null) {
    whereCondition = { id: { [Op.or]: menuList } };
  }

  const menus = await Menu.findAll({
    where: whereCondition,
    include: [
      {
        model: Company,
        as: "companies",
        where: { id: companyId }
      }
    ]
  });

  return menus;
};

export default ShowCompanyMenuService;
