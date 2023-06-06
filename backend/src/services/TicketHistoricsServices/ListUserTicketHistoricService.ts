import { Op } from "sequelize";
import User from "../../database/models/User";
import { endOfDay, parseISO, startOfDay } from "date-fns";
import TicketChanges from "../../database/models/TicketChanges";

interface Request {
    companyId: number;
    initialDate: string;
    finalDate: string;
}

const ListUserTicketHistoricService = async ({
    companyId,
    initialDate,
    finalDate
}: Request): Promise<User[]> => {
    let dateFilter = null;

    if (initialDate && finalDate) {
        dateFilter = {
            createdAt: {
                [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
            },
        }
    }

    const reports = await User.findAll({
        where: { companyId, deletedAt: null },
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

export default ListUserTicketHistoricService;
