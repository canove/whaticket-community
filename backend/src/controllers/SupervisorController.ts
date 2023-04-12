import { Request, Response } from "express";

import { Sequelize } from "sequelize-typescript";
import { Op } from "sequelize";

import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import Ticket from "../database/models/Ticket";
import Queue from "../database/models/Queue";
import User from "../database/models/User";
import Message from "../database/models/Message";
import Category from "../database/models/Category";
import { endOfDay, startOfDay } from "date-fns";
import TicketHistorics from "../database/models/TicketHistorics";
import Contact from "../database/models/Contact";

type IndexQuery = {
    tab: string,
    status: string,
    queueId: string,
    userId: string,
    pageNumber: string,
    categoryId: string,
    contactNumber: string,
}

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { tab, status, queueId, userId, pageNumber, categoryId, contactNumber } = req.query as IndexQuery;
    const { companyId } = req.user;

    let info = null;

    const initialDate = new Date();
    initialDate.setDate(initialDate.getDate() - 30);

    const finalDate = new Date();

    const dateFilter = { [Op.between]: [+startOfDay(initialDate), +endOfDay(finalDate)] }

    switch (tab) {
        case "queue":
            info = [];
    
            const queues: any = await Queue.findAll({
                where: { companyId },
                attributes: [
                    "id", 
                    "name", 
                    "color",
                    "limit",
                ],
            });

            for (const queue of queues) {
                const ticket_count: any = await Ticket.findOne({
                    where: { companyId, queueId: queue.id, updatedAt: dateFilter },
                    attributes: [
                        [ Sequelize.fn('sum', Sequelize.literal('status = "pending"')), "pending_tickets" ],
                        [ Sequelize.fn('sum', Sequelize.literal('status = "open"')), "open_tickets" ],
                        [ Sequelize.fn('sum', Sequelize.literal('status = "closed"')), "closed_tickets" ],
                    ],
                    raw: true,
                });

                const newQueue = {
                    ...queue.dataValues,
                    ...ticket_count
                }

                info.push(newQueue);
            }
    
            const no_queue: any = await Ticket.findOne({
                where: { companyId, queueId: null, updatedAt: dateFilter },
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

            info.push(no_queue_info);
        break;
        case "user":
            info = [];

            const users: any = await User.findAll({
                where: { companyId, deletedAt: null },
                attributes: [
                    "id", 
                    "name",
                ],
            });

            const historics = await User.findAll({
                where: { companyId, deletedAt: null },
                attributes: ["id"],
                include: [
                    {
                        model: TicketHistorics,
                        as: "ticketHistorics",
                        attributes: ["id", "ticketId", "ticketCreatedAt", "transferedAt", "finalizedAt", "reopenedAt", "acceptedAt", "createdAt"],
                        where: {
                            [Op.or]: [
                                { ticketCreatedAt: { [Op.ne]: null } },
                                { transferedAt: { [Op.ne]: null } },
                                { finalizedAt: { [Op.ne]: null } },
                                { reopenedAt: { [Op.ne]: null } },
                                { acceptedAt: { [Op.ne]: null } },
                            ],
                            createdAt: dateFilter
                        },
                        required: true,
                        order: [["createdAt", "ASC"]],
                    },
                ],
            });

            for (const user of users) {
                const serviceTime = historics.find(historic => user.id === historic.id);

                const ticket_count: any = await Ticket.findOne({
                    where: { companyId, userId: user.id, updatedAt: dateFilter },
                    attributes: [
                        [ Sequelize.fn('sum', Sequelize.literal('status = "pending"')), "pending_tickets" ],
                        [ Sequelize.fn('sum', Sequelize.literal('status = "open"')), "open_tickets" ],
                        [ Sequelize.fn('sum', Sequelize.literal('status = "closed"')), "closed_tickets" ],
                    ],
                    raw: true,
                });

                const pending = (!ticket_count.pending_tickets || ticket_count.pending_tickets == 0) ? null : ticket_count.pending_tickets;
                const open = (!ticket_count.open_tickets || ticket_count.open_tickets == 0) ? null : ticket_count.open_tickets;
                const closed = (!ticket_count.closed_tickets || ticket_count.closed_tickets == 0) ? null : ticket_count.closed_tickets;

                if (!pending && !open && !closed) continue;

                let lastSentMessage = null;

                const lastMessage = await Message.findOne({
                    where: { fromMe: true, userId: user.id },
                    attributes: ["id", "fromMe", "createdAt"],
                    include: [
                        {
                            model: Ticket,
                            as: "ticket",
                            where: { companyId },
                            required: true
                        }
                    ],
                    order: [["createdAt", "DESC"]],
                });

                if (lastMessage && lastMessage.createdAt) {
                    const now = new Date();
                    const messageDate = new Date(lastMessage.createdAt);

                    lastSentMessage = now.getTime() - messageDate.getTime();
                }

                const newUser = {
                    ...user.dataValues,
                    ...ticket_count,
                    ticketHistorics: serviceTime ? serviceTime.ticketHistorics : null,
                    lastSentMessage
                };

                info.push(newUser);
            }
    
            const no_user: any = await Ticket.findOne({
                where: { companyId, userId: null, updatedAt: dateFilter },
                attributes: [
                    [ Sequelize.fn('sum', Sequelize.literal('status = "pending"')), "pending_tickets" ],
                    [ Sequelize.fn('sum', Sequelize.literal('status = "open"')), "open_tickets" ],
                    [ Sequelize.fn('sum', Sequelize.literal('status = "closed"')), "closed_tickets" ],
                ],
                raw: true,
            });
    
            const no_user_info = {
                id: "NO_USER",
                name: "SEM USER",
                pending_tickets: no_user.pending_tickets,
                open_tickets: no_user.open_tickets,
                closed_tickets: no_user.closed_tickets,
            }

            info.push(no_user_info);
        break;
        case "ticket":
            let whereCondition = null;
            let includeCondition = [];

            whereCondition = { companyId, updatedAt: dateFilter };
            includeCondition = [
                {
                    model: Queue,
                    as: "queue",
                    attributes: ["id", "name", "color"],
                    required: false
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name"],
                    where: { deletedAt: null },
                    required: false,
                },
                {
                    model: Category,
                    as: "category",
                    attributes: ["id", "name"],
                    required: false
                },
            ]

            if (status) {
                whereCondition = { 
                    ...whereCondition, 
                    status
                };
            }

            if (queueId) {
                whereCondition = {
                    ...whereCondition,
                    queueId: queueId === "NO_QUEUE" ? null : queueId
                };
            }

            if (userId) {
                whereCondition = {
                    ...whereCondition,
                    userId: userId === "NO_USER" ? null : userId
                };
            }

            if (categoryId) {
                whereCondition = {
                    ...whereCondition,
                    categoryId: categoryId === "NO_CATEGORY" ? null : categoryId
                };
            }

            if (contactNumber) {
                includeCondition.push({
                    model: Contact,
                    as: "contact",
                    where: {
                        "$contact.number$": Sequelize.where(
                            Sequelize.fn("LOWER", Sequelize.col("contact.number")),
                            "LIKE",
                            `%${contactNumber.toLowerCase()}%`
                        )  
                    },
                    attributes: ["id", "number"],
                    required: true,
                });
            } else {
                includeCondition.push({
                    model: Contact,
                    as: "contact",
                    attributes: ["id", "number"],
                    required: false,
                });
            }

            const limit = 20;
            const offset = limit * (+pageNumber - 1);

            const { count, rows: tickets }: any = await Ticket.findAndCountAll({
                where: whereCondition,
                attributes: [
                    "id", 
                    "queueId", 
                    "status",
                    "updatedAt",
                ],
                include: includeCondition,
                limit,
                offset,
                group: "Ticket.id",
                order: [["updatedAt", "DESC"]],
            });

            let newTickets = [];

            for (const ticket of tickets) {
                const { count: sent_count, rows: sentMessages } = await Message.findAndCountAll({
                    where: { fromMe: true },
                    attributes: ["id", "createdAt"],
                    include: [
                        {
                            model: Ticket,
                            as: "ticket",
                            where: { id: ticket.id, companyId },
                            attributes: ["id"],
                            required: true,
                        }
                    ],
                    order: [["createdAt", "DESC"]]
                });
                
                const { count: received_count, rows: receivedMessages } = await Message.findAndCountAll({
                    where: { fromMe: false },
                    attributes: ["id", "createdAt"],
                    include: [
                        {
                            model: Ticket,
                            as: "ticket",
                            where: { id: ticket.id, companyId },
                            attributes: ["id"],
                            required: true,
                        }
                    ],
                    order: [["createdAt", "DESC"]]
                });

                const newTicket = {
                    ...ticket.dataValues,
                    sent_messages: sent_count,
                    received_messages: received_count,
                    lastSentMessage: (sentMessages && sentMessages.length > 0) ? sentMessages[0].createdAt : null,
                    lastReceivedMessage: (receivedMessages && receivedMessages.length > 0) ? receivedMessages[0].createdAt : null,
                };

                newTickets.push(newTicket);
            }

            info = { tickets: newTickets, count: count.length };
        break;
    }

    return res.status(200).json(info);
};
