import AppError from "../../errors/AppError";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import { Op, Sequelize } from "sequelize";
import { endOfDay, parseISO, startOfDay } from "date-fns";

interface Request {
  date?: string 
  initialDate?: string; 
  finalDate?: string;
  companyId?: number;
}

interface Response {
  sent: number;
  received: number;
}

const CountMessagesServices = async ({ 
  companyId, 
  date, 
  initialDate, 
  finalDate 
}: Request): Promise<Response> => {
  let whereCondition = null;

  if (date) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      },
    }
  }

  if (initialDate && finalDate) {
    const i = new Date(+startOfDay(parseISO(initialDate)));
    const f = new Date(+endOfDay(parseISO(finalDate)));

    const thirtyDays = 31 * 24 * 60 * 60 * 1000; // dia * horas * minutos * segundos * milisegundos

    if (!(f.getTime() - i.getTime() >= thirtyDays)) {
      whereCondition = {
        ...whereCondition,
        createdAt: {
          [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
        },
      };
    }
  }

  const sent = await Message.count({
    where: { ...whereCondition, fromMe: true },
    include: [
      {
        model: Ticket,
        as: "ticket",
        where: { companyId },
        required: true
      }
    ],
  });

  const received = await Message.count({
    where: { ...whereCondition, fromMe: false },
    include: [
      {
        model: Ticket,
        as: "ticket",
        where: { companyId },
        required: true
      }
    ],
  });

  return { sent, received };
};

export default CountMessagesServices;
