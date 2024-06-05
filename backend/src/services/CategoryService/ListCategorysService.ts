import Category from "../../models/Category";

const ListCategorysService = async (): Promise<Category[]> => {
  const categorys = await Category.findAll({ order: [["name", "ASC"]] });

  return categorys;
};

export default ListCategorysService;
