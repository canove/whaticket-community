import Category from "../../database/models/Category";

interface Request {
    name: string;
    description: string;
};

const CreateCategoryService = async ({
    name,
    description,

}: Request): Promise<Category> => {

const category = await Category.create({
    name,
    description,
  });

  return category;
};

export default CreateCategoryService;