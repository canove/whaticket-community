import Menu from "../../database/models/Menu";
import AppError from "../../errors/AppError";

const DeleteMenuService = async (id: string | number): Promise<void> => {
  const menu = await Menu.findOne({
    where: { id }
  });

  if (!menu) {
    throw new AppError("ERR_NO_MENU_FOUND", 404);
  }

  await menu.destroy();
};

export default DeleteMenuService;
