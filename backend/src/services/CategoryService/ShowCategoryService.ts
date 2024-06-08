import AppError from "../../errors/AppError";
import Category from "../../models/Category";

const ShowCategoryService = async (
  categoryId: number | string
): Promise<Category> => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    throw new AppError("ERR_QUEUE_NOT_FOUND");
  }

  return category;
};

export default ShowCategoryService;
