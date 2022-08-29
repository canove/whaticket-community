import Menu from "../../database/models/Menu";

interface Request {
  name: string;
  icon: string;
  parentId?: number | null;
  isParent?: boolean;
}

const CreateMenuService = async ({
  name,
  icon,
  parentId,
  isParent = false
}: Request): Promise<Menu> => {
  const menu = await Menu.create({
    name,
    icon,
    parentId,
    isParent
  });

  await menu.reload();

  return menu;
};

export default CreateMenuService;
