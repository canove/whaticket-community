/* eslint-disable */
import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Op } from "sequelize";
import Category from "../../database/models/Category";
import Ticket from "../../database/models/Ticket";
import Whatsapp from "../../database/models/Whatsapp";

interface Request {
  companyId: string | number;
  date: string;
  categoryId: string;
}

const DashboardCategoryService = async ({
  companyId,
  date,
  categoryId
}: Request): Promise<Category[]> => {
  let whereCondition = null;

  whereCondition = { companyId };

  if (date) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      },
    };
  }

  let ticketInclude = null;
  
  if (categoryId) {
    ticketInclude = {
      include: [
        {
          model: Whatsapp,
          as: "whatsapp",
          where: { connectionFileId: categoryId },
          required: true,
        }
      ]
    }
  }

  const categories = await Category.findAll({ where: whereCondition });
  const arrayQuantity = [];

  for (const category of categories) {
    const { count } = await Ticket.findAndCountAll({
      where: { categoryId: category.id },
      ...ticketInclude
    });

    if (count > 0) {
      arrayQuantity.push({ count, name: category.name });
    }
  }

  if (arrayQuantity.length === 0) {
    return [];
  }

  if (arrayQuantity.length >= 3) {
    const response = [];

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
