import ShowCategoryService from "./ShowCategoryService";

const DeleteCategoryService = async (
  categoryId: number | string
): Promise<void> => {
  const category = await ShowCategoryService(categoryId);

  await category.destroy();
};

export default DeleteCategoryService;
