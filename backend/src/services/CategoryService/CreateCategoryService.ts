import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Category from "../../models/Category";

interface CategoryData {
  name: string;
  color: string;
}

const CreateCategoryService = async (
  categoryData: CategoryData
): Promise<Category> => {
  const { name, color } = categoryData;

  const categorySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_Category_INVALID_NAME")
      .required("ERR_Category_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_Category_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const CategoryWithSameName = await Category.findOne({
              where: { name: value }
            });

            return !CategoryWithSameName;
          }
          return false;
        }
      ),
    color: Yup.string()
      .required("ERR_QUEUE_INVALID_COLOR")
      .test("Check-color", "ERR_QUEUE_INVALID_COLOR", async value => {
        if (value) {
          const colorTestRegex = /^#[0-9a-f]{3,6}$/i;
          return colorTestRegex.test(value);
        }
        return false;
      })
      .test(
        "Check-color-exists",
        "ERR_category_COLOR_ALREADY_EXISTS",
        async value => {
          if (value) {
            const categoryWithSameColor = await Category.findOne({
              where: { color: value }
            });
            return !categoryWithSameColor;
          }
          return false;
        }
      )
  });

  try {
    await categorySchema.validate({ color, name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const category = await Category.create(categoryData);

  return category;
};

export default CreateCategoryService;
