import { Op } from "sequelize";
import Category from "../../database/models/Category";
import Ticket from "../../database/models/Ticket";

const DashboardCategoryService = async (
  companyId: string | number,
  date: string,
): Promise<Category[]> => {
  let whereCondition = null
   whereCondition = {companyId}
     const getDate = (option: string) => {
    if (option === "MORNING") {
      let morningDate = new Date(`${date} GMT-3`);
      morningDate.setHours(0, 0, 0, 0);
      return morningDate;
    }

    if (option === "NIGHT") {
      let nightDate = new Date(`${date} GMT-3`);
      nightDate.setHours(23, 59, 59, 999);
      return nightDate;
    }
  }
    if (date){
      whereCondition = {
        ...whereCondition,
          createdAt: {
            [Op.gte]: getDate("MORNING"),
            [Op.lte]: getDate("NIGHT"),
          },
        }
    }
  const categories = await Category.findAll({ where: whereCondition });
  const arrayQuantity = [];
  for (const category of categories) {
    const { count } = await Ticket.findAndCountAll({
      where: { categoryId: category.id }
    });
    if(count > 0){
      arrayQuantity.push({ count, name: category.name });
    };
  };
  if (arrayQuantity.length === 0) {
    return [];
  }
  if (arrayQuantity.length >= 3) {
    let response = [];

    for (const quantity of arrayQuantity) {
      if (response.length >= 3) {
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
