import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Op } from "sequelize";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import AppError from "../../errors/AppError";

interface Request {
    companyId: number;
    initialDate: string;
    finalDate: string;
}

interface Response {
    clientResponseTime: number;
    userResponseTime: number;
}

const GetClientResponseTimeService = async ({
    companyId,
    initialDate,
    finalDate,
}: Request): Promise<Response> => {
    let dateFilter = null;

    if (initialDate && finalDate) {
        const i = new Date(+startOfDay(parseISO(initialDate)));
        const f = new Date(+endOfDay(parseISO(finalDate)));
        const thirtyDays = 31 * 24 * 60 * 60 * 1000;

        if (f.getTime() - i.getTime() >= thirtyDays) throw new AppError("ERR_MAX_31_DAYS");

        dateFilter = {
            createdAt: {
                [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
            },
        }
    }

    const messages = await Message.findAll({
        where: { responseTime: { [Op.ne]: null }, ...dateFilter },
        attributes: ["id", "fromMe", "responseTime"],
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

    let clientResponseTime = 0;
    let userResponseTime = 0;

    const clientMessages = messages.filter(message => !message.fromMe);
    const userMessages = messages.filter(message => message.fromMe);

    const clientSum = clientMessages.reduce((accumulator, message) => {
        return accumulator + message.responseTime;
    }, 0);

    const userSum = userMessages.reduce((accumulator, message) => {
        return accumulator + message.responseTime;
    }, 0);

    clientResponseTime = clientMessages.length === 0 ? 0 : clientSum / clientMessages.length;
    userResponseTime = userMessages.length === 0 ? 0 : userSum / userMessages.length;

    return { clientResponseTime, userResponseTime };
};

export default GetClientResponseTimeService;
