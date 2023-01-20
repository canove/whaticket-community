import Category from "../../database/models/Category";
import ShowCategoryService from "./ShowCategoryService";

interface CategoryData {
  name: string;
  description: string;
}
interface Request {
  categoryData: CategoryData;
  categoryId: number | string;
  companyId: number | string;
}

const UpdateCategoryService = async ({
  categoryData,
  categoryId,
  companyId
}: Request): Promise<Category> => {
  const category = await ShowCategoryService(categoryId, companyId);

  const { name, description } = categoryData;

  console.log("update category categoryService 23");
  await category.update({
    name,
    description
  });

  return category;
};

export default UpdateCategoryService;
