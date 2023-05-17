import { Model, Op } from "sequelize";
import Company from "../../database/models/Company";
import Menu from "../../database/models/Menu";
import ShowUserService from "../UserServices/ShowUserService";

const ShowMenuLayoutService = async (companyId: number, userId: string | number): Promise<Menu[]> => {
  const user = await ShowUserService(userId, companyId);

  let menuList = null;

  try {
    menuList = JSON.parse(user.profiles.menus);
  } catch {
    menuList = [];
  }

  let whereCondition = null;

  if (menuList !== null) {
    whereCondition = { id: { [Op.or]: menuList } }
  }

  const menus1 = await Menu.findAll({
    where: { ...whereCondition, isParent: false, parentId: null },
    include: [
      {
        model: Company,
        as: "companies",
        attributes: ["id"],
        where: { id: companyId },
        required: true
      },
    ],
  });

  const menus2 = await Menu.findAll({
    where: { isParent: true, parentId: null },
    include: [
      {
        model: Menu,
        as: "childrenMenus",
        where: whereCondition,
        include: [
          {
            model: Company,
            as: "companies",
            attributes: ["id"],
            where: { id: companyId },
            required: true
          },
        ],
        required: true,
      }
    ]
  });

  const menus3 = await Menu.findAll({
    where: { isParent: true, parentId: { [Op.ne]: null } },
    include: [
      {
        model: Menu,
        as: "childrenMenus",
        where: whereCondition,
        include: [
          {
            model: Company,
            as: "companies",
            attributes: ["id"],
            where: { id: companyId },
            required: true
          },
        ],
        required: true,
      }
    ]
  });

  for (const menu of menus2) {
    const parentId = menu.id;

    const newChildren = menus3.filter(menu => parentId === menu.parentId);
    const childrenMenus = menu["childrenMenus"];

    menu.setDataValue("childrenMenus", childrenMenus.concat(newChildren));
    // menu["childrenMenus"] = childrenMenus.concat(newChildren);
  }

  if (menus2.length > 0) {
    return menus1.concat(menus2);
  }

  return menus1.concat(menus3);
};

export default ShowMenuLayoutService;
