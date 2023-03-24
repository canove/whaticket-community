import { Request, Response } from "express";

import { Sequelize } from "sequelize-typescript";
import { Op } from "sequelize";

import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import Ticket from "../database/models/Ticket";
import Queue from "../database/models/Queue";

type IndexQuery = {
    type: string,
    status: string,
    queueId: string,
}

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { type, status, queueId } = req.query as IndexQuery;
    const { companyId } = req.user;

    let info = null;

    switch (type) {
        case "queue":
            const queues = await Queue.findAll({
                where: { companyId },
                attributes: [
                    "id", 
                    "name", 
                    "color",
                    [ Sequelize.fn('sum', Sequelize.literal('tickets.status = "pending"')), "pending_tickets" ],
                    [ Sequelize.fn('sum', Sequelize.literal('tickets.status = "open"')), "open_tickets" ],
                    [ Sequelize.fn('sum', Sequelize.literal('tickets.status = "closed"')), "closed_tickets" ],
                ],
                include: [
                    {
                        model: Ticket,
                        as: "tickets",
                        attributes: ["id"],
                        required: false,
                    }
                ],
                group: "Queue.id"
            });
    
            const no_queue: any = await Ticket.findOne({
                where: { companyId, queueId: null },
                attributes: [
                    [ Sequelize.fn('sum', Sequelize.literal('status = "pending"')), "pending_tickets" ],
                    [ Sequelize.fn('sum', Sequelize.literal('status = "open"')), "open_tickets" ],
                    [ Sequelize.fn('sum', Sequelize.literal('status = "closed"')), "closed_tickets" ],
                ],
                raw: true,
            });
    
            const no_queue_info = {
                id: "NO_QUEUE",
                name: "SEM FILA",
                pending_tickets: no_queue.pending_tickets,
                open_tickets: no_queue.open_tickets,
                closed_tickets: no_queue.closed_tickets,
            }
    
            info = [...queues, no_queue_info];
        break;
        case "queue-ticket":
            if (queueId === "NO_QUEUE") {
                let whereConditionTicket = null;

                whereConditionTicket = { companyId };

                if (status) whereConditionTicket = { ...whereConditionTicket, status };
                if (queueId) whereConditionTicket = { ...whereConditionTicket, queueId: null };

                const tickets = await Ticket.findAll({
                    where: whereConditionTicket,
                    attributes: ["id", "queueId", "status"],
                });

                info = tickets;
            } else {
                let whereConditionTicket = null;

                whereConditionTicket = { companyId };

                if (status) whereConditionTicket = { ...whereConditionTicket, status };
                if (queueId) whereConditionTicket = { ...whereConditionTicket, queueId };

                const tickets = await Ticket.findAll({
                    where: whereConditionTicket,
                    attributes: ["id", "queueId", "status"],
                    include: [
                        {
                            model: Queue,
                            as: "queue",
                            attributes: ["id", "name", "color"]
                        }
                    ]
                });

                info = tickets;
            }
        break;
    }

    return res.status(200).json(info);
};
