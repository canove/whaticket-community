import Menu from "../../database/models/Menu";

const ListMenusService = async (): Promise<Menu[]> => {
  const menus = await Menu.findAll();

  return menus;
};

export default ListMenusService;
