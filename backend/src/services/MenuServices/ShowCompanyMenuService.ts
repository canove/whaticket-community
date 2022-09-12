import Company from "../../database/models/Company";
import Menu from "../../database/models/Menu";

const ShowCompanyMenuService = async (id: string | number): Promise<Menu[]> => {
  const menus = await Menu.findAll({
    include: [
      {
        model: Company,
        as: "companies",
        where: { id }
      }
    ]
  });

  return menus;
};

export default ShowCompanyMenuService;
