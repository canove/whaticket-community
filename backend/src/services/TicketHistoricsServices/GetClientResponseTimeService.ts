import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Op } from "sequelize";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";

interface Request {
    companyId: number;
    initialDate: string;
    finalDate: string;
}

const GetClientResponseTimeService = async ({
    companyId,
    initialDate,
    finalDate,
}: Request): Promise<number> => {
    let dateFilter = null;

    if (initialDate && finalDate) {
        dateFilter = {
            createdAt: {
                [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
            },
        }
    }

    const { count, rows: messages } = await Message.findAndCountAll({
        where: { responseTime: { [Op.ne]: null }, ...dateFilter },
        attributes: ["responseTime"],
        include: [
            {
                model: Ticket,
                as: "ticket",
                attributes: [],
                where: { companyId },
                required: true,
            }
        ]
    });

    let responseTime = 0;

    const sum = messages.reduce((accumulator, message) => {
        return accumulator + message.responseTime;
    }, 0);

    responseTime = sum / count;

    return responseTime;
};

export default GetClientResponseTimeService;
