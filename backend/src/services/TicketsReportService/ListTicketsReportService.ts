import { QueryTypes } from "sequelize";
import Message from "../../database/models/Message";

interface Request {
  ticketId: number;
  companyId: number;
}

const ListTicketsReportService = async ({
  ticketId,
  companyId
}: Request): Promise<Message[]> => {
  const messages: Message[] = await Message.sequelize?.query(
    `
        select
            msg.id, msg.body, msg.mediaUrl, msg.ticketId, msg.createdAt, msg.read
        from
            whaticket.Messages as msg
        inner join
            whaticket.Tickets as ticket
        on
            msg.ticketId = ticket.id
        where
            ticket.id = ${ticketId}
        and
            ticket.companyId = ${companyId} 
    `,
    { type: QueryTypes.SELECT }
  );

  return messages;
};

export default ListTicketsReportService;
