import Company from "../../database/models/Company";
import Menu from "../../database/models/Menu";

const ListMenusService = async (): Promise<Menu[]> => {
  const menus = await Menu.findAll({
    attributes: ["id", "name", "icon", "isParent", "parentId"],
    include: [
      {
        model: Company,
        as: "companies",
        attributes: ["id"]
      }
    ]
  });

  return menus;
};

export default ListMenusService;
