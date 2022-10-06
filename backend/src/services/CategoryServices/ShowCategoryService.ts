import Category from "../../database/models/Category";
import AppError from "../../errors/AppError";

const ShowCategoryService = async (
  id: string | number,
  companyId: string | number
): Promise<Category> => {
  const category = await Category.findOne({ where: { id, companyId } });

  if (!category) {
    throw new AppError("ERR_NO_CATEGORY_FOUND", 404);
  }

  return category;
};

export default ShowCategoryService;
