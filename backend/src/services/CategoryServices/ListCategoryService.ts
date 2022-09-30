import Category from "../../database/models/Category";

const ListCategoryService = async (): Promise<Category[]> => {
  const category = await Category.findAll();

  return category;
};

export default ListCategoryService;