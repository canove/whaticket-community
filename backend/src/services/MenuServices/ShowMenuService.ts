import Menu from "../../database/models/Menu";
import AppError from "../../errors/AppError";

const ShowMenuService = async (id: string | number): Promise<Menu> => {
  const menu = await Menu.findByPk(id);

  if (!menu) {
    throw new AppError("ERR_NO_MENU_FOUND", 404);
  }

  return menu;
};

export default ShowMenuService;
