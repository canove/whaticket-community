import { QueryTypes } from "sequelize/types";
import Message from "../../models/Message";

interface Request {
    ticketId: Number;
}

interface Response {

}

const ListTicketsReportService = async ({
    ticketId: Number,
}: Request): Promise<Response | undefined> => {
    return await Message.sequelize?.query(`
        select 
            msg.id, msg.body, msg.mediaUrl, msg.ticketId, msg.createdAt, msg.read 
        from 
            whaticket.Messages as msg 
        inner join 
            whaticket.Tickets as ticket 
        on 
            msg.ticketId = ticket.id 
        where 
            ticket.id === ${ticketId}
    `,
    { type: QueryTypes.SELECT }
    );
};

export default ListTicketsReportService;
