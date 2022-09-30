import Category from "../../database/models/Category";
import ShowCategoryService from "./ShowCategoryService";
interface CategoryData {
    name: string;
    description: string;
}
interface Request {
  categoryData: CategoryData;
  categoryId: number | string;
}

const UpdateCategoryService = async ({
  categoryData,
  categoryId
}: Request): Promise<Category> => {
  const category = await ShowCategoryService(categoryId);

  const { name, description } =
    categoryData;

  await category.update({
    name,
    description,

  });

  return category;
};

export default UpdateCategoryService;
