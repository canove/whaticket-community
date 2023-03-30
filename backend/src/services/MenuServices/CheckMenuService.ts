import Company from "../../database/models/Company";
import Menu from "../../database/models/Menu";

const CheckMenuService = async (menuName: string, companyId: number): Promise<boolean> => {
  const menu = await Menu.findOne({
    where: { name: menuName },
    include: [
      {
        model: Company,
        as: "companies",
        where: { id: companyId }
      }
    ]
  });

  if (menu) return true;

  return false
};

export default CheckMenuService;
