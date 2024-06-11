import AppError from "../../errors/AppError";
import ChatbotOption from "../../models/ChatbotOption";
import Queue from "../../models/Queue";
import User from "../../models/User";

const ShowQueueService = async (queueId: number | string): Promise<Queue> => {
  const queue = await Queue.findByPk(queueId, {
    include: [
      {
        model: ChatbotOption,
        as: "chatbotOptions",
        where: {
          fatherChatbotOptionId: null
        },
        required: false
      },
      {
        model: User,
        as: "users",
        required: false
      }
    ]
  });

  if (!queue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND");
  }

  return queue;
};

export default ShowQueueService;
