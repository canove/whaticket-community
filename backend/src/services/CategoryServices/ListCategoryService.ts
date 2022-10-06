import Category from "../../database/models/Category";

const ListCategoryService = async (
  companyId: string | number
): Promise<Category[]> => {
  const category = await Category.findAll({
    where: { companyId },
    order: [["name", "ASC"]]
  });

  return category;
};

export default ListCategoryService;
