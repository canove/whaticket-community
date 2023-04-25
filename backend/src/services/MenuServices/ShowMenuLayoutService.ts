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
  let whereConditionChildren1 = null;
  let whereConditionChildren2 = null;

  whereCondition = { parentId: null };
  whereConditionChildren1 = { isParent: false };
  whereConditionChildren2 = { isParent: true };

  if (menuList !== null) {
    whereCondition = { 
      ...whereCondition,
      [Op.or]: [
        { 
          id: { [Op.or]: menuList },
          isParent: false
        },
        {
          isParent: true
        }
      ]
    };

    whereConditionChildren1 = { ...whereConditionChildren1, id: { [Op.or]: menuList } };
  }

  const menus1 = await Menu.findAll({
    where: { ...whereCondition, isParent: false },
    include: [
      {
        model: Company,
        as: "companies",
        where: { id: companyId },
        required: true
      },
    ]
  });

  const menus2 = await Menu.findAll({
    where: { ...whereCondition, isParent: true },
    include: [
      {
        model: Menu,
        as: "childrenMenus1",
        where: whereConditionChildren1,
        include: [
          {
            model: Company,
            as: "companies",
            where: { id: companyId },
            required: true
          },
        ],
        required: true
      },
      {
        model: Menu,
        as: "childrenMenus2",
        where: whereConditionChildren2,
        include: [
          {
            model: Menu,
            as: "childrenMenus1",
            where: whereConditionChildren1,
            include: [
              {
                model: Company,
                as: "companies",
                where: { id: companyId },
                required: true
              },
            ],
            required: true
          },
          {
            model: Menu,
            as: "childrenMenus2",
            where: whereConditionChildren2,
            include: [
              {
                model: Menu,
                as: "childrenMenus1",
                where: whereConditionChildren1,
                include: [
                  {
                    model: Company,
                    as: "companies",
                    where: { id: companyId },
                    required: true
                  },
                ],
                required: true
              },
              {
                model: Menu,
                as: "childrenMenus2",
                where: whereConditionChildren2,
                required: false
              }
            ],
            required: false
          }
        ],
        required: false
      },
    ]
  });

  return menus1.concat(menus2);
};

export default ShowMenuLayoutService;
