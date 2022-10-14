import Menu from "../../database/models/Menu";
import AppError from "../../errors/AppError";

const ShowMenuService = async (
  id: string | number,
  companyId: string | number
): Promise<Menu> => {
  let whereCondition = null;

  whereCondition = {
    id,
    isParent: true
  };

  if (companyId === 1) {
    whereCondition = { id };
  }

  const menu = await Menu.findOne({
    where: whereCondition
  });

  if (!menu) {
    throw new AppError("ERR_NO_MENU_FOUND", 404);
  }

  return menu;
};

export default ShowMenuService;
