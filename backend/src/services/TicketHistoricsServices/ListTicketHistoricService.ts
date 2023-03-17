import { Op } from "sequelize";
import Queue from "../../database/models/Queue";
import TicketHistorics from "../../database/models/TicketHistorics";

interface Request {
    companyId: number;
}

interface Response {
    reports: Queue[];
}

const ListTicketHistoricService = async ({
    companyId
}: Request): Promise<Response> => {
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
                },
                required: true,
                order: [["createdAt", "ASC"]],
            }
        ],
    });

    return { reports };
};

export default ListTicketHistoricService;
