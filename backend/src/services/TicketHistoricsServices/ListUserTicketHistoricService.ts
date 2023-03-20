import { Op } from "sequelize";
import User from "../../database/models/User";
import TicketHistorics from "../../database/models/TicketHistorics";
import { endOfDay, parseISO, startOfDay } from "date-fns";

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
                        { acceptedAt: { [Op.ne]: null } },
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

export default ListUserTicketHistoricService;
