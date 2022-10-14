import Menu from "../../database/models/Menu";
import ShowMenuService from "./ShowMenuService";

interface MenuData {
  name?: string;
  icon?: string;
  parentId?: number;
  isParent?: boolean;
}

interface Request {
  menuData?: MenuData;
  menuId: number | string;
  companyId: number | string;
}

const UpdateMenuService = async ({
  menuData,
  menuId,
  companyId
}: Request): Promise<Menu | undefined> => {
  const menu = await ShowMenuService(menuId, companyId);

  const { name, icon, parentId, isParent } = menuData;

  await menu.update({
    name,
    icon,
    parentId,
    isParent
  });

  await menu.reload();

  return menu;
};

export default UpdateMenuService;
