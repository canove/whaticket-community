import { Op } from "sequelize";
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Category from "../../models/Category";
import ShowCategoryService from "./ShowCategoryService";

interface CategoryData {
  name?: string;
  color?: string;
}

const UpdateCategoryService = async (
  categoryId: number | string,
  categoryData: CategoryData
): Promise<Category> => {
  const { name, color } = categoryData;

  const categorySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_CATEGORY_NAME_MIN_LENGTH")
      .test(
        "Check-unique-name",
        "ERR_QUEUE_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const categoryWithSameName = await Category.findOne({
              where: { name: value, id: { [Op.not]: categoryId } }
            });

            return !categoryWithSameName;
          }
          return true;
        }
      ),
    color: Yup.string()
      .required("ERR_CATEGORY_COLOR_REQUIRED")
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
    await categorySchema.validate({ name, color });
  } catch (err) {
    throw new AppError(err.message);
  }

  const category = await ShowCategoryService(categoryId);

  await category.update(categoryData);

  return category;
};

export default UpdateCategoryService;
