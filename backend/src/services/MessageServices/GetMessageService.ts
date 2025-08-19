import Message from "../../models/Message";
import { Op } from "sequelize";

interface Request {
	ticketId: number;
	messageId: string;
  daysRange?: number;
}

interface Response {
  messages: Message[];
}

const GetMessage = async ({ 
  ticketId, 
  messageId, 
}: Request): Promise<Response> => {
	const clickedMsg = await Message.findOne({
		where: { id: messageId, ticketId }
	});

	if (!clickedMsg) return { messages: [] };

		const targetDate = new Date(clickedMsg.createdAt);
		const msInHour = 60 * 60 * 1000;
			const minDate = targetDate.getTime() - msInHour;
			const maxDate = targetDate.getTime() + msInHour;

			const messages = await Message.findAll({
				where: {
					ticketId,
					createdAt: {
						[Op.between]: [minDate, maxDate]
					}
				},
				order: [["createdAt", "ASC"]]
			});

	return { messages };
};

export default GetMessage;
