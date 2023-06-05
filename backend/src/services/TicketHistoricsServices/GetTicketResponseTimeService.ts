import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Op } from "sequelize";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import TicketChanges from "../../database/models/TicketChanges";

interface Request {
    companyId: number;
    initialDate: string;
    finalDate: string;
}

const GetTicketResponseTimeService = async ({
    companyId,
    initialDate,
    finalDate,
}: Request): Promise<Ticket[]> => {
    let dateFilter = null;

    if (initialDate && finalDate) {
        dateFilter = {
            createdAt: {
                [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
            },
        }
    }

    const tickets = await Ticket.findAll({
        where: { ...dateFilter },
        attributes: ["id"],
        include: [
            {
                model: TicketChanges,
                as: "ticketChanges",
                attributes: ["id", "change", "createdAt", "newStatus"],
                required: true,
            },
            {
                model: Message,
                as: "messages",
                attributes: ["id", "fromMe", "responseTime"],
                required: true,
            },
        ],
    });

    return tickets;
};

export default GetTicketResponseTimeService;
