import Category from "../../database/models/Category";
import AppError from "../../errors/AppError";

const DeleteCategoryService = async (id: string | number): Promise<void> => {
  const category = await Category.findOne({
    where: { id }
  });

  if (!category) {
    throw new AppError("ERR_NO_CATEGORY_FOUND", 404);
  }

  await category.destroy();
};

export default DeleteCategoryService;
