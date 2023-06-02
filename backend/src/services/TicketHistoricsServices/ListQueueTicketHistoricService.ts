import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Op } from "sequelize";
import Queue from "../../database/models/Queue";
import TicketChanges from "../../database/models/TicketChanges";

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
                model: TicketChanges,
                as: "historics",
                where: {
                    ...dateFilter,
                    change: ["CREATE", "TRANSFER", "FINALIZE", "REOPEN", "ACCEPT"],
                },
                required: true,
                order: [["createdAt", "ASC"]],
            },
        ],
    })

    return reports;
};

export default ListQueueTicketHistoricService;
