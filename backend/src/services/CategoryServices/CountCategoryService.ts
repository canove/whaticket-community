/* eslint-disable */
import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import Category from "../../database/models/Category";
import Ticket from "../../database/models/Ticket";
import Whatsapp from "../../database/models/Whatsapp";

interface Request {
  companyId: number;
  name: string;
  initialDate: string;
  finalDate: string;
}

const CountCategoryService = async ({
  name,
  initialDate,
  finalDate,
  companyId
}: Request): Promise<Category[]> => {
  let whereConditionCategory = null;
  let whereConditionTicket = null;

  whereConditionCategory = { companyId };

  if (name) {
    whereConditionCategory = {
      ...whereConditionCategory,
      "$Category.name$": Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("Category.name")),
        "LIKE",
        `%${name.toLowerCase()}%`
      )
    }
  }

  if (initialDate && finalDate) {
    whereConditionTicket = {
      ...whereConditionTicket,
      finalizedAt: {
        [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
      },
    };
  }

  const reports = await Category.findAll({
    where: whereConditionCategory,
    attributes: { 
      include: [
        [Sequelize.fn("COUNT", Sequelize.col("tickets.id")), "ticketCount"]
      ] 
    },
    include: [
      {
        model: Ticket,
        as: "tickets",
        attributes: [],
        where: whereConditionTicket,
      }
    ],
    raw: true,
    group: ['Category.id']
  });

  return reports;
};

export default CountCategoryService;
