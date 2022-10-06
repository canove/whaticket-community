import Category from "../../database/models/Category";

interface Request {
  name: string;
  description: string;
  companyId: string | number;
}

const CreateCategoryService = async ({
  name,
  description,
  companyId
}: Request): Promise<Category> => {
  const category = await Category.create({
    name,
    description,
    companyId
  });

  return category;
};

export default CreateCategoryService;
