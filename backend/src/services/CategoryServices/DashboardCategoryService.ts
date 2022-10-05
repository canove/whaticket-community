import Category from "../../database/models/Category";
import Ticket from "../../database/models/Ticket";

const DashboardCategoryService = async (
  companyId: string | number
): Promise<Category[]> => {
  const categories = await Category.findAll({ where: { companyId } });
  const arrayQuantity = [];
  for (const category of categories) {
    const { count } = await Ticket.findAndCountAll({
      where: { categoryId: category.id }
    });
    arrayQuantity.push({ count, name: category.name });
  }
  if (arrayQuantity.length === 0) {
    return [];
  }
  if (arrayQuantity.length > 3) {
    let response = [];

    for (const quantity of arrayQuantity) {
      if (response.length > 3) {
        for (const res of response) {
          if (quantity.count > res.count) {
            const index = response.indexOf(res);
            response[index] = quantity;
          }
        }
      } else {
        response.push(quantity);
      }
    }
  }
  return arrayQuantity;
};

export default DashboardCategoryService;
