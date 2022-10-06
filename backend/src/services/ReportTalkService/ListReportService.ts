import { QueryTypes } from "sequelize";
import Message from "../../database/models/Message";

interface Request {
  user: number;
  initialDate: string;
  finalDate: string;
}

const ListReportService = async ({
  user = 0,
  initialDate = "",
  finalDate = ""
}: Request): Promise<Message[]> => {
  const messages: Message[] = await Message.sequelize?.query(
    `${
      " select " +
      " msg.id, msg.body, msg.mediaUrl, msg.ticketId, msg.createdAt, msg.`read`" +
      " from " +
      " whaticket.Messages as msg " +
      " inner join " +
      " whaticket.Tickets as tck on msg.ticketId = tck.id " +
      " where " +
      " tck.userId = "
    }${user} and ` +
      ` msg.createdAt >= '${initialDate} dd/MM/yy HH:mm' ` +
      " and " +
      ` msg.createdAt <= '${finalDate} dd/MM/yy HH:mm' `,
    {
      type: QueryTypes.SELECT
    }
  );

  return messages;
};

export default ListReportService;
