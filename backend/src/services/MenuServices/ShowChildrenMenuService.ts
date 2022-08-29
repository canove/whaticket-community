import Menu from "../../database/models/Menu";

const ShowChildrenMenuService = async (
  id: string | number
): Promise<Menu[]> => {
  const menus = await Menu.findAll({
    where: { parentId: id }
  });

  return menus;
};

export default ShowChildrenMenuService;
