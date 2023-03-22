import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Op } from "sequelize";
import Queue from "../../database/models/Queue";
import TicketHistorics from "../../database/models/TicketHistorics";

interface Request {
    companyId: number;
    initialDate: string;
    finalDate: string;
}

const ListQueueTicketHistoricService = async ({
    companyId,
    initialDate,
    finalDate,
}: Request): Promise<Queue[]> => {
    let dateFilter = null;

    if (initialDate && finalDate) {
        dateFilter = {
            createdAt: {
                [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
            },
        }
    }

    const reports = await Queue.findAll({
        where: { companyId },
        attributes: ["id", "name"],
        include: [
            {
                model: TicketHistorics,
                as: "ticketHistorics",
                where: {
                    [Op.or]: [
                        { ticketCreatedAt: { [Op.ne]: null } },
                        { transferedAt: { [Op.ne]: null } },
                        { finalizedAt: { [Op.ne]: null } },
                        { reopenedAt: { [Op.ne]: null } },
                    ],
                    ...dateFilter
                },
                required: true,
                order: [["createdAt", "ASC"]],
            }
        ],
    });

    return reports;
};

export default ListQueueTicketHistoricService;
