import { Op, Sequelize } from "sequelize";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface Request {
    ticketId: string;
    searchParam: string;
    pageNumber?: string;
}

interface Response {
    messages: Message[];
    count: number;
    hasMore: boolean;
}

const SearchMessageService = async ({
    ticketId,
    searchParam,
    pageNumber = "1"
}: Request): Promise<Response> => {
    const ticket = await ShowTicketService(ticketId);

    if (!ticket) {
        throw new AppError("ERR_NO_TICKET_FOUND", 404);
    }

    const limit = 20;
    const offset = limit * (+pageNumber - 1);

    const { count, rows: messages } = await Message.findAndCountAll({
        where: {
            ticketId,
            [Op.and]: [
                Sequelize.literal(`MATCH (body) AGAINST ('"${searchParam}"' IN BOOLEAN MODE)`)
            ]
        },
        limit,
        offset,
        include: [
            "contact",
            {
                model: Message,
                as: "quotedMsg",
                include: ["contact"]
            }
        ],
        order: [["createdAt", "DESC"]]
    });

    const hasMore = count > offset + messages.length;

    return {
        messages: messages.reverse(),
        count,
        hasMore
    };
};

export default SearchMessageService;
