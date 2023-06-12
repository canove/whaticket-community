/* eslint-disable */
import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Op } from "sequelize";
import Category from "../../database/models/Category";
import Ticket from "../../database/models/Ticket";
import Whatsapp from "../../database/models/Whatsapp";

interface Request {
  companyId: string | number;
  categoryId?: string;
  date?: string;
  initialDate?: string;
  finalDate?: string;
}

const DashboardCategoryService = async ({
  companyId,
  date,
  categoryId,
  initialDate, 
  finalDate,
}: Request): Promise<Category[]> => {
  let whereConditionTicket = null;

  whereConditionTicket = { companyId };

  if (date) {
    whereConditionTicket = {
      ...whereConditionTicket,
      finalizedAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      },
    };
  }

  // if (initialDate && finalDate) {
  //   const i = new Date(+startOfDay(parseISO(initialDate)));
  //   const f = new Date(+endOfDay(parseISO(finalDate)));

  //   const thirtyDays = 31 * 24 * 60 * 60 * 1000; // dia * horas * minutos * segundos * milisegundos

  //   if (!(f.getTime() - i.getTime() >= thirtyDays)) {
  //     whereConditionTicket = {
  //       ...whereConditionTicket,
  //       finalizedAt: {
  //         [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
  //       },
  //     };
  //   }
  // }

  let ticketInclude = [];
  
  if (categoryId) {
    ticketInclude = [
      {
        model: Whatsapp,
        as: "whatsapp",
        where: { connectionFileId: categoryId },
        required: true,
      }
    ]
  }

  if (date) {
    const categories = await Category.findAll({
      where: { companyId },
      attributes: ["id", "name"],
      include: [
        {
          model: Ticket,
          as: "tickets",
          where: whereConditionTicket,
          attributes: ["id"],
          include: ticketInclude,
          required: true,
        }
      ],
    });

    const result = [];

    for (const category of categories) {
      const tickets = category.tickets;

      const count = tickets.length;
      const name = category.name;

      if (count === 0) continue;

      result.push({ count, name });
    } 

    return result;
  }

  return [];
};

export default DashboardCategoryService;
